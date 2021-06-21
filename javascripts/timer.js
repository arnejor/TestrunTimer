window.onbeforeunload = function() {
    return "Data will be lost if you leave the page, are you sure?";
  };
  
          var ms=0, s=0,m=0;
          var timer;
          var temp = [];
  
          var stopwatchEl = document.querySelector(".stopwatch");
          var lapsContainer = document.querySelector(".laps");
  
          function start() {
              if(!timer){
              timer=setInterval(run, 10);
              }
          }
  
          function run() {
              stopwatchEl.textContent = (m<10 ? "0" + m:m ) + ";" + (s<10 ? "0" + s : s) +";"+ (ms<10 ? "0" + ms:ms);
              ms++;
              if(ms==100) {
                  ms=0;
                  s++
              }
              if(s==60){
                  s=0;
                  m++;
              }        
          }
          function pause() {
              clearInterval(timer);
              timer=false;
          }
          function stop() {
              clearInterval(timer);
              timer=false;
              ms=0;
              s=0;
              m=0;
              stopwatchEl.textContent = (m<10 ? "0" + m:m ) + ";" + (s<10 ? "0" + s : s) +";"+ (ms<10 ? "0" + ms:ms);
  
          }
          function getTimer() {
              return((m<10 ? "0" + m:m ) + ";" + (s<10 ? "0" + s : s) +";"+ (ms<10 ? "0" + ms:ms));
          }
  
  
          function lap() {
  
              if(timer){
                  var li = document.createElement("li") ;
                  var nr = document.getElementById("startnumber").value;
  
                  li.innerText=getTimer()+" startnummer: "+ nr ;
                  lapsContainer.appendChild(li);
                  const timer = (getTimer()+"S"+ nr );
                  temp.push(timer);
                         document.getElementById('startnumber').value ='' ;
                  
                  document.getElementById("timingTable").value = temp;
  
              }
          
          
  
          
  
          }
          function resetLaps(){
              lapsContainer.innerHTML="";
          }

          (function () {
            'use strict'

            // Fetch all the forms we want to apply custom Bootstrap validation styles to
            const forms = document.querySelectorAll('.validated-form')

            // Loop over them and prevent submission
            Array.from(forms)
                .forEach(function (form) {
                    form.addEventListener('submit', function (event) {
                        if (!form.checkValidity()) {
                            event.preventDefault()
                            event.stopPropagation()
                        }

                        form.classList.add('was-validated')
                    }, false)
                })
        })()