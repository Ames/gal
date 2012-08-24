

/**
*This is the holder for all the javascript. It is bound at document load.
*Provided by jQuery. Keep everything in here.
*/
$( document ).bind('pageinit', function(){

	//Current Directory
	  var directory= document.location.search.substring(1);  

      var imgs={};
      IMGS=imgs; ///Who doesn't love All CAPS?
      
      var lazyload = true;
      // lazy loading will work like this:
      //    the function shouldLoadThumb(img) returns true if img is near view
      //    initially, no images are loaded.
      //    whenever the 
      
	  //Do we have an image in focus?
      var curImg=false;

      var win=[];
      
      window.onresize=function(){
         win[0] = window.innerWidth;
         win[1] = window.innerHeight;
         if(window.doLayout)  //If we know how to reload the image
            doLayout();// reload the image??
      }
       window.onresize();
     
      
      //Scrape Function Defined in Previous JS File
      doScrape(directory,function(files){
        
		var prev=false;
		
        for(var i in files){
          var f = files[i];

          if(f.type =='image2'){
            f.prev = prev; //Begin assembling the Linked List
            f.next = false;
            imgs[f.name] = f;
			
            if(prev){
              imgs[prev].next=f.name;
            }

            f.path=directory+'/'+f.name; // an extra slash never hurt anyone...
            
			f.img=document.createElement('img');
            f.thumb=document.createElement('img');

            if(!prev){
                loadImage(f); //preload the first image
            }
			
            prev=f.name;  
			
			      
          }else if(f.type=='parent'){
             imgs['../']=f;
             f.name='../';
             f.type='folder';
             
          }else if(f.type=='folder'){
              imgs[f.name] = f;
          }else{
             console.log("Unknown File Listing: " + f.name + " - " + f.type)
          }
        }

        var files=[];
        for(var i in imgs){
            var f=imgs[i];
            if(f.type=='image2'){
                files.push(imgs[i].path);
            }

        }
        
        // we get a nice error if files is empty
        
        postRequest('thumb.php','info='+files.join(','),function(info){
			
            for(var i in imgs){
                var f=imgs[i];
                var inf=info[decodeURIComponent(f.path)];
                if(!inf){
                    //console.log('no info for',f);
                    f.w=1;
                    f.h=1;
                }else{
                    f.w=inf.w;
                    f.h=inf.h;
                }
            }
            
            
            window.onhashchange();
        });

      });


      window.showThumbs=function(){

        
         
        document.body.innerHTML="";

        var container = document.createElement('div');
        document.body.appendChild(container);

/*
        var p = document.createElement('a');
        var pd = document.createElement('div');
        var pt = document.createElement('p');
        p.appendChild(pd);
        pt.innerHTML = "../";
        pd.appendChild(pt);
        pd.className='folder';
        p.href = getParent();
        //container.appendChild(p);
*/

        for(var i in imgs){
          var f=imgs[i];
          if(f.type=='folder'){
              var folderLink = document.createElement('a');
              var folderDiv = document.createElement('div');
              var folderText = document.createElement('p');
              folderLink.appendChild(folderDiv);
              folderDiv.appendChild(folderText);
              folderDiv.className='folder';
              folderLink.href = location.search + f.name + "/#*";
              if(f.name=='../') folderLink.href=getParent()
              folderText.innerHTML = f.name;

                          container.appendChild(folderLink);
              
              f.thumb=folderDiv;
              f.thumb.fileInfo = f;
              continue; //Go to next Image Candidate
          }
          
          //if(!f.thumb.src)
            //f.thumb.src='thumb.php?perim=400&f='+f.path;

          //console.log(f.thumb)
          //f.img.className='thumb';
          f.thumb.className='thumb';
          
          
          f.thumb.onload = function(){
             //f.thumb.style.display='block';
             //window.wall.reload()
          };
          //console.log("blah");
          var a=document.createElement('a');
          //console.log(f.name)
          a.href='#'+f.name;
          a.className='thumbHolder';
          //a.appendChild(f.img);
          
          a.appendChild(f.thumb);
          
                 //lets add some color
              //
              R = Math.floor(Math.random()*256)
              G = Math.floor(Math.random()*256)
              B = Math.floor(Math.random()*256)
              var col = 'rgba(' + R + ',' + G  + ',' + B + ',0.1)';
              a.style.background = col;
           

          container.appendChild(a);
          
          //f.thumb.style.opacity=0;
          
          (function(th){
              th.onload = function(){
                 th.style.opacity=1;
                 th.parentNode.style.background = "transparent"
              };
          })(f.thumb);

          
           //document.body.appendChild(a);
           
          //txt+='<a href="#'+f.name+'"><img src="'+f.path+'" class="thumb"></a>';
        }
        
        
        doLayout();
        

        //document.body.innerHTML=txt;

        //wall.reload();
      }
      
      
      doLayout=function(){
        
        //k, now lay out the images
        
        // this is where we'd start if we wanted to re-layout, e.g. after resize
        
        
        // we're doing it justified. flickr style.
        
        // the idea is:
        //   with a fixed height, add images to a row.
        //   once the row is past a certain threshold,
        //     resize the row vertically so that it fits horizontally.
        
        var targetRatio=win[0]/250;
        var margin=4;
        
        var rowMax=win[0]/targetRatio;
        
        
        var addRow=function(row,rowTotal){
            var rowHeight=(win[0]-(row.length+1)*margin)/rowTotal;
            if(rowHeight>rowMax)rowHeight=rowMax;
            
            //console.log(row,rowTotal,rowHeight);
            
            for(var j in row){
                var g=row[j];
                var w=Math.round(rowHeight/g.h*g.w-margin);
                var h=Math.round(rowHeight-margin);
                
                g.thumb.style.width=w+'px';
                g.thumb.style.height=h+'px';
                
                g.thumbW=w;
                g.thumbH=h;

               
                //g.thumb.src='thumb.php?w='+w+'&h='+h+'&f='+g.path;
            }
        }
        
        
        var curRow,curRowTotal;
        
        for(var i in imgs){
            var f=imgs[i];
            
            if(!curRow){
                curRowTotal=0;
                curRow=[];
            }
            
            curRow.push(f);
            curRowTotal+=f.w/f.h;
            
            //console.log(f.w/f.h);
            
            if(curRowTotal>=targetRatio){
                addRow(curRow,curRowTotal);
                curRow=false;
            }
        }
        if(curRow)
            addRow(curRow,curRowTotal); //this might get awkward...

        
        doLazyLoad();

        //console.log(imgs); 
        
      }
      
      

      window.onhashchange=function(){
        var name=window.location.hash.substring(1);
        //r
        //handle none;
        //console.log("Hash changed to: "+ name);
        if(name=='*'){
            curImg=false;
          window.showThumbs();
        }else if(imgs[name]){
          showImage(imgs[name]);
        }else if(name=="listimg"){
            console.log(imgs);
        }else{
          window.location.hash='*';
        }    
      }

      getParent=function(){
          var current = location.search;
          return current.split("/").slice(0,-2).join("/")+'/#*' 
      }
      showImage=function(f){
        document.body.innerHTML=""; //crude

        window.curPath = f.path;
        loadImage(f); //load this image...
        if(f.next) loadImage(imgs[f.next]); // and the next
        if(f.prev) loadImage(imgs[f.prev]); // and the previous

        if(f.next && imgs[f.next].next)
          loadImage(imgs[imgs[f.next].next]); // heck, why not the one after the next

        f.img.className='big';
        var a=document.createElement('a');
        a.href='#'+(f.next?f.next:'!');
        a.appendChild(f.img);
        document.body.appendChild(a);
       // document.body.innerHTML='<a href="#'++'"><img src="'+f.path+'" class="big"></a>';
        curImg=f;
      }

      loadImage=function(f){
        if(!f.img.src)
            f.img.src='thumb.php?w='+win[0]+'&h='+win[1]+'&f='+f.path;
            //f.img.src=f.path;

            //if we were fancy we could look at the current screen/window size...
            // we'd probably snap to a few standard sizes, to make cacheing more effective

            // it'd be cool to prioritize loading
      }

      // load the thumbs in view.
      doLazyLoad=function(){
        for(var i in imgs){
            var img=imgs[i];
            var src='thumb.php?w='+img.thumbW+'&h='+img.thumbH+'&f='+img.path;
            if(shouldLoadThumb(img) && img.thumb.src!=src)
                img.thumb.src=src;
            // we'll hope this won't prompt an image to reload if w and h didn't change...
        }

      }
      
      // returns true if a thumb should be loaded
      shouldLoadThumb=function(img){
         
         if(!img.thumb) return false;
         
         if(!lazyload) return true; //show everything
         
         var preloadMargin=win[1]*1.5; // how far out of view an image needs to be to load it
         
         // we want to load an image if any of it is visible, or perhaps almost visible...
         var winTop=document.body.scrollTop;
         var imgTop=img.thumb.offsetTop;
         var winH=win[1];
         var imgH=img.thumbH;
         
         return imgTop + imgH + preloadMargin > winTop
             && imgTop - preloadMargin < winTop + winH;
        
      }
      
      window.onscroll=function(){
        doLazyLoad();
        
      }

      window.onkeydown=function(e){
        console.log(e.keyIdentifier);
        switch(e.keyCode){
          case 'Left':
          case 'U+004B':
          case 37:
            if(curImg)
              if(curImg.prev)
                window.location.hash=curImg.prev;
            break;
          case 'Right':
          case 'U+004A':
          case 39:
            if(curImg)
              if(curImg.next)
                window.location.hash=curImg.next;
            break;
          case 'U+001B': //esc
          case 27:
            window.location.hash='*';
            break;
          case 68:
            if(curImg)
              window.open(window.curPath);
            break;
/*

          console.log(e.keyIdentifier);
        switch(e.keyIdentifier){
          case 'Left':
          case 'U+004B':
            if(curImg)
              if(curImg.prev)
                window.location.hash=curImg.prev;
            break;
          case 'Right':
          case 'U+004A':
            if(curImg)
              if(curImg.next)
                window.location.hash=curImg.next;
            break;
          case 'U+001B': //esc
            window.location.hash='*';
            break;  
*/
        }
      }

      
      $( window ).swiperight(function() {
          if(curImg){
            if(curImg.prev){
              window.location.hash=curImg.prev;}
            else{
                window.location.hash='*';
            }}
      })

      $( window ).swipeleft(function(){
          if(curImg)
            if(curImg.next)
              window.location.hash=curImg.next;
            else
              window.location.hash='*';
      })

      
});

// makes an ajax request, calls cb with parsed json or empty for error
function postRequest(url,data,cb){
    var req=new XMLHttpRequest();
    req.onreadystatechange=function(){
        if (req.readyState==4 && req.status==200){
            cb(JSON.parse(req.responseText));
        }
        if (req.readyState==4 && req.status!=200){
            cb({});
        }
    }
    req.open("POST",url,true);
    req.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    req.send(data);
}
