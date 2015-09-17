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

        if (parseInt(window.device.version) === 7) {
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

        document.getElementById("BatteryLabel").innerHTML = "Wait...";
        window.addEventListener('batterystatus', this.onBatteryStatusChange, false);

        document.getElementById("DeviceInfo").innerHTML = "Modello: " + device.model.toString() + "<br/>" +
                                                          "Piattaforma: " + device.platform.toString() + "<br/>" +
                                                          "Versione: " + device.version.toString() + "<br/>";

        

    },
    onBatteryStatusChange: function (info) {

        document.getElementById("BatteryLabel").innerHTML = "Batteria: " + info.level + "<br/>Sotto carica: " + info.isPlugged;

    },
    doScan: function() {
        try {

            if (cordova.plugins) {
                alert("si");
            } else {
                alert("no");
            }

            cordova.plugins.barcodeScanner.scan(
              function (result) {
                  alert("We got a barcode\n" +
                        "Result: " + result.text + "\n" +
                        "Format: " + result.format + "\n" +
                        "Cancelled: " + result.cancelled);
              },
              function (error) {
                  alert("Scanning failed: " + error);
              }
           );

        } catch (e) {
            alert("ERRORE: " + e.message.toString());
        }
    }
};

function doSomething() {
    alert("alert javascript");
}

function doHello() {
    navigator.notification.beep(1);
    navigator.vibrate(3000);
    navigator.notification.alert("Notifica nativa dello smartphone.", doSomething, "Titolo Notifica", "CHIUDI");
}

