

//Mobile jquery
$( document ).bind('pageinit', function(){

    
    //console.log("trying to init")

      var directory= document.location.search.substring(1);  

      //console.log(directory)

      var imgs={};
      IMGS=imgs;

      var curImg=false;

      var win=[];
      
      window.onresize=function(){

         win[0] = window.innerWidth;
         win[1] = window.innerHeight;
         
         // reload the image??
      }
      
      window.onresize();
      
      //Scrapedirectoryectory
      doScrape(directory,function(files){


        var prev=false;

        for(var i in files){
          var f=files[i];

          if(f.type=='image2'){

            f.prev=prev;
            f.next=false;
            imgs[f.name]=f;

            f.path=directory+'/'+f.name; // an extra slash never hurt anyone...

            f.img=document.createElement('img');

            //f.img.src=f.path; // we might not want to do this quite yet...

            f.thumb=document.createElement('img');

            if(prev){
              imgs[prev].next=f.name;
            }

            if(!prev){
                loadImage(f); //preload the first image
            }

            prev=f.name;        
          }else if(f.type=='parent'){
          ;
          }else if(f.type=='folder'){
              //console.log("folder was found");
              imgs[f.name] = f;
          }else{
             ; //console.log(f.name,f.type)
          }
        }


        window.onhashchange();

      });


      window.showThumbs=function(){

        document.body.innerHTML="";

        var container = document.createElement('div');
        document.body.appendChild(container);


        var p = document.createElement('a');
        var pd = document.createElement('div');
        var pt = document.createElement('p');
        p.appendChild(pd);
        pt.innerHTML = "../";
        pd.appendChild(pt);
        pd.className='folder';
        p.href = getParent();
        container.appendChild(p);
        //document.body.appendChild(p);


        window.wall = new Masonry(container, {gutterWidth:1});
        for(var i in imgs){
          var f=imgs[i];
          if(f.type=='folder'){
              var folderLink = document.createElement('a');
              var folderDiv = document.createElement('div');
              var folderText = document.createElement('p');
              folderLink.appendChild(folderDiv);
              folderDiv.appendChild(folderText);
              folderDiv.className='folder';
              folderLink.href = location.search + f.name + "/";
              folderText.innerHTML = f.name;
              container.appendChild(folderLink);
              //document.body.appendChild(folderLink);
              continue;
          }
          if(!f.thumb.src)
            f.thumb.src='thumb.php?h=180&w=400&f='+f.path;

          console.log(f.thumb)
          //f.img.className='thumb';
          f.thumb.className='thumb';
          f.thumb.onload = function(){window.wall.reload()};
          console.log("blah");
          var a=document.createElement('a');
          console.log(f.name)
          a.href='#'+f.name;
          //a.appendChild(f.img);
          a.appendChild(f.thumb);
          container.appendChild(a);
          //document.body.appendChild(a);

          //txt+='<a href="#'+f.name+'"><img src="'+f.path+'" class="thumb"></a>';
        }
        //document.body.innerHTML=txt;

        wall.reload();
      }

      window.onhashchange=function(){
        var name=window.location.hash.substring(1);
        //handle none;
        //console.log("Hash changed to: "+ name);
        if(name=='*'){
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
          return current.split("/").slice(0,-2).join("/")+'/' 
      }
      showImage=function(f){
        document.body.innerHTML=""; //crude

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

      window.onkeydown=function(e){
        //console.log(e);
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

      
})
