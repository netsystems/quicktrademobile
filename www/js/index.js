/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
 
var _fs = null;

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');

        if (parseInt(window.device.version) >= 7) {
            document.getElementById("headerText").innerHTML = "<br/>" + document.getElementById("headerText").innerHTML;
        }

    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        /*var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');
        */
        console.log('Received Event: ' + id);


        try {
            window.removeEventListener('batterystatus');
        } catch (e) {
        }
        window.addEventListener('batterystatus', this.onBatteryStatusChange, false);

        
      

        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
            _fs = fs;
        }, function (err) {
            alert("Errore recupero filesystem: " + err.message);
        });
       
        

    },
    onBatteryStatusChange: function (info) {

        document.getElementById("DeviceInfo").innerHTML = "Modello: " + device.model.toString() + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + info.level + "%";
        if (info.isPlugged) {
            document.getElementById("DeviceInfo").innerHTML += " (In Carica)";
        }

    }
};

function errorHandler(e) {
    var msg = '';

    switch (e.code) {
        case FileError.QUOTA_EXCEEDED_ERR:
            msg = 'QUOTA_EXCEEDED_ERR';
            break;
        case FileError.NOT_FOUND_ERR:
            msg = 'NOT_FOUND_ERR';
            break;
        case FileError.SECURITY_ERR:
            msg = 'SECURITY_ERR';
            break;
        case FileError.INVALID_MODIFICATION_ERR:
            msg = 'INVALID_MODIFICATION_ERR';
            break;
        case FileError.INVALID_STATE_ERR:
            msg = 'INVALID_STATE_ERR';
            break;
        default:
            msg = 'Unknown Error';
            break;
    };

    alert("Error - se " + se + ": " + msg);
}

var se = "";

function doWrite() {

    try {

if (!_fs) {
            alert("FS non ancora caricata.");
            return;
        }

        var myFile = "test.json";

        se = "1";

        _fs.root.getFile(myFile, { create: true, exclusive: false }, function (fileEntry) {


            se = "2";
            fileEntry.createWriter(function (fileWriter) {

                fileWriter.onwriteend = function (e) {
                    alert('Write completed.');
                };

                fileWriter.onerror = function (e) {
                    alert('Write failed: ' + e.toString());
                };

                // Create a new Blob and write it to log.txt.
                var blob = new Blob([$("#textRow").val().toString()], { type: "text/plain" });

                fileWriter.write(blob);

            }, errorHandler);


        }, errorHandler);




    } catch (e) {
        alert("Errore dowrite: " + e.message);
    }

    

}
 

function doRead() {

    try {

        if (!_fs) {
            alert("FS non ancora caricata.");
            return;
        }

        var myFile = "test.json";

        se = "1";

        _fs.root.getFile(myFile, {}, function (fileEntry) {


            se = "2";
            // Get a File object representing the file,
            // then use FileReader to read its contents.
            fileEntry.file(function (file) {
                var reader = new FileReader();

                reader.onloadend = function (e) {
                    //var txtArea = document.createElement('textarea');
                    //txtArea.value = this.result;
                    //document.body.appendChild(txtArea);

                    alert("Testo:\n" + this.result.toString());

                };

                reader.readAsText(file);
            }, errorHandler);


        }, errorHandler);




    } catch (e) {
        alert("Errore doread: " + e.message);
    }
}
 

function doRemove() {
    try {

        if (!_fs) {
            alert("FS non ancora caricata.");
            return;
        }

        var myFile = "test.json";

        se = "1";

        _fs.root.getFile(myFile, {}, function (fileEntry) {

            se = "2";
            fileEntry.remove(function () {
                alert("File removed.");
            }, errorHandler);

        }, errorHandler);




    } catch (e) {
        alert("Errore doremove: " + e.message);
    }
}


function doExist() {
    try {

        if (!_fs) {
            alert("FS non ancora caricata.");
            return;
        }

        var myFile = "test.json";

        se = "1";
        _fs.root.getFile(myFile, {}, function () {
            alert("File exists.");
        }, function () {
            alert("File NOT exists.");
        });

    } catch (e) {
        alert("Errore doexist: " + e.message);
    }
}