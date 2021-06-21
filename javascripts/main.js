// validation of forms
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

// participant list creation
var temp = [];
function participant() {    
    var list = document.getElementById('demo');
    var name = document.getElementById('name').value;
    var participantNumber = document.getElementById('participantNumber').value;           
    var entry = document.createElement('li');
    entry.appendChild(document.createTextNode(participantNumber+" \xa0\xa0\xa0\xa0\xa0\xa0\xa0" +name ));
    var part= name + ";" + participantNumber +";";
    if(check(temp, participantNumber)){
    }else{
      temp.push(part);
            console.log(temp);
            document.getElementById("participants").value = temp;
            list.appendChild(entry);  
    }
}
function check(temp, participantNumber) {
    for(let i of temp){
        if(i.includes(";"+participantNumber+";")){
            
            console.log("duplicate found", temp[i])
        return true    
        }else{
            console.log("All good")
        };
    };
}


// export of excel format
function exportTableToExcel(tableID, filename = ''){
    var downloadLink;
    var dataType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    var tableSelect = document.getElementById(tableID);
    var tableHTML = tableSelect.outerHTML.replace(/ /g, '%20');
    // Specify file name
    filename = filename?filename+'.xls':'excel_data.xls';
    // Create download link element
    downloadLink = document.createElement("a");
    document.body.appendChild(downloadLink);
    if(navigator.msSaveOrOpenBlob){
        var blob = new Blob(['\ufeff', tableHTML], {
            type: dataType
        });
        navigator.msSaveOrOpenBlob( blob, filename);
    }else{
        // Create a link to the file
        downloadLink.href = 'data:' + dataType + ', ' + tableHTML;
        // Setting the file name
        downloadLink.download = filename;
        //triggering the function
        downloadLink.click();
    }
}

  