
function doScrape(dir,cb){
  
  req=new XMLHttpRequest();
  
  req.onreadystatechange=function(){
    if (req.readyState==4 && req.status==200){
      
      
      /// some crude HTML parsing ///
      
      var tmp=document.createElement('div');
      tmp.innerHTML=req.responseText;
      
      TMP=tmp;
      
      var files=[];
      
      var tbody=tmp.getElementsByTagName('tbody');
      var pre=tmp.getElementsByTagName('pre');

      if(tbody.length>0){
        console.log("above")
        tbody=tbody[0];
        
        for(var i in tbody.children){
          if(i<3)continue; //chuck the first 3 (headers,line,back)
          var ch=tbody.children[i];
          if(ch.childElementCount!=5)continue; //we expect 5.
          
          var f={}
          
          var imgParts=ch.children[0].children[0].src.split('/');
          f.type=imgParts[imgParts.length-1].split('.')[0];
          
          //hrefParts
          var hrP=ch.children[1].children[0].href.split('/');
          f.name=decodeURIComponent(hrP[hrP.length-1]?hrP[hrP.length-1]:hrP[hrP.length-2])
          //f.name=ch.children[1].innerText.trim();
          f.date=ch.children[2].innerText.trim();
          f.size=ch.children[3].innerText.trim();
          //I don't care about the Description field.
          files.push(f);
        }
        
        cb(files);
        return;
        
      }else if(pre.length>0){
        console.log("below")
        pre=pre[0];
        preSplit=pre.innerHTML.split('\n');
        var dv=document.createElement('div');
        for(var i in preSplit){
          if(i<1)continue; //header
          dv.innerHTML=preSplit[i];
          
          if(dv.children.length<2)continue;// we want at least 2 things...
          
          var f={};
          
          var imgParts=dv.children[0].src.split('/');
          f.type=imgParts[imgParts.length-1].split('.')[0];
          
          //hrefParts
          var hrP=dv.children[1].href.split('/');
          f.name=decodeURIComponent(hrP[hrP.length-1]?hrP[hrP.length-1]:hrP[hrP.length-2]);
          var textParts=dv.childNodes[dv.childNodes.length-1].wholeText.fulltrim().split(' ');
          
          f.date=textParts[0]+' '+textParts[1];
          f.size=textParts[2];
          
          
          // we'll assume no 'description'.
          
          files.push(f);
          
        }
        cb(files);
        return;
        
      }else{
        //? 
      }

      cb([]);
    }
  }
  req.open("GET",dir,true);
  req.send();
  
}

// http://stackoverflow.com/a/498995
String.prototype.fulltrim=function(){return this.replace(/(?:(?:^|\n)\s+|\s+(?:$|\n))/g,'').replace(/\s+/g,' ');}
