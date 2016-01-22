var _qtConfig = null;
var _qtDS = null;
var _firstStart = false;
var _qtOrders = null;
var _qtOrderWorking = null;
var _qtProfile = null;
//var _stringValue = null;
var _CustomerList = null;
var _CustomerDestinationList = null;
var _qtOrdersUpload = null;
var _ProfileInfo = null;
var _ListinoViewed = null;
var _ListinoBarcodeToShow = null;
var _ListinoShowListinoCodice = null;


var app = {
    // Application Constructor
    initialize: function () {
        this.bindEvents();
    },
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    onDeviceReady: function () {
        //LoaderShow("Benvenuto!");
        //Sistemo la status bar
        /*if (StatusBar) {
            try {
                StatusBar.overlaysWebView(false);
                StatusBar.styleBlackOpaque();
                StatusBar.backgroundColorByHexString("#fdbf44");
            } catch (e) {
                alert("StatusBar: " + e.message);
            }
        } else {
            alert("StatusBar: non esiste l'oggetto.");
        }*/

        
        //Inizializzo la configurazione
        QTConfigInitAndVerify();

        //Leggo anche profilo
        QTProfileInitAndVerify();

        //Leggo anche datasource
        QTDataSourceInitAndVerify();

        //Leggo anche ordini memorizzati
        QTOrderListInitAndVerify();

        //La riga qui sotto viene spostata nella funzione che carica il file più pesante: QTDataSourceInitAndVerify
        //$("#pageMainContent").css("display", "");

    }
};

$(document).ready(function () {
    LoaderShow("Benvenuto!");
});

function QTConfigInitAndVerify() {
    //Inizializzo la configurazione
    try {
        _qtConfig = new QTConfiguration();
        _qtConfig.initialize();

        //Success, ConfigNotFound, Fail
        _qtConfig.loadFromFile(function (_readConfig) {
            //Configurazione letta
            _qtConfig.ServerIP = _readConfig.ServerIP;
            _qtConfig.ServerPortNumber = _readConfig.ServerPortNumber;
            //_qtConfig.OperatoreCodiceQT = _readConfig.OperatoreCodiceQT;

        }, function () {
            //File inesistente, propongo quindi la configurazione
            navigator.notification.alert("E' necessario effettuare la configurazione iniziale.", function () {
                _firstStart = true;
                PageChange("#pageOptions");
            }, "Benvenuto", "OK");

        }, function (err) {
            //Errore lettura file.
            alert("Errore file: " + err.message);
        });

    } catch (e) {
        alert("Error Inizializzazione Configurazione: " + e.message);
    }
}

function QTProfileInitAndVerify() {
    //Inizializzo la configurazione
    try {
        _qtProfile = new QTProfile();
        _qtProfile.initialize();

        //Success, ConfigNotFound, Fail
        _qtProfile.loadFromFile(function (_readConfig) {
            //Configurazione letta
            _qtProfile.OperatoreCodice = _readConfig.OperatoreCodice;
            _qtProfile.OperatoreDescrizione = _readConfig.OperatoreDescrizione;

        }, function () {
            //File inesistente, propongo quindi la configurazione
            _qtProfile.OperatoreCodice = "";
            _qtProfile.OperatoreDescrizione = "";


        }, function (err) {
            //Errore lettura file.
            alert("Errore file: " + err.message);
        });

    } catch (e) {
        alert("Error Inizializzazione Profilo: " + e.message);
    }
}

function QTDataSourceInitAndVerify(Success) {
    //Inizializzo e verifico il datasource
    try {
        _qtDS = new QTDataSource();

        //Success, ConfigNotFound, Fail
        _qtDS.loadFromFile(function (_readDS) {
            //Datasource letto
            _qtDS.dataSource = _readDS;

            //$("#pageMainHeader").val("Quick Trade | " + _qtDS.dataSource.generalInfo.fairSeason + " - " + _qtDS.dataSource.generalInfo.fairDescr);
            $("#pageMainFairInfo").html(" Fiera " + _qtDS.dataSource.generalInfo.fairSeason + " - " + _qtDS.dataSource.generalInfo.fairDescr);

            LoaderHide();
            $("#pageMainContent").css("display", "");

            if (Success) Success();

        }, function () {
            //File inesistente, propongo quindi la configurazione
            _qtDS.dataSource = null;
            //alert("Datasource non trovato.");
            LoaderHide();

        }, function (err) {
            //Errore lettura file.
            alert("Errore datasource: " + err.message);
            LoaderHide();

        });
    } catch (e) {
        alert("Error Inizializzazione DataSource: " + e.message);
    }
}

function QTOrderListInitAndVerify() {
    //Inizializzo e verifico se ho ordini memorizzati in locale
    try {
        _qtOrders = new QTOrderList();

        _qtOrders.loadFromFile(function (_read) {
            // letto
            _qtOrders.orders = _read;

            //verifico se ho ordini salvati in sospeso o se ho ordini salvati da uploadare
            OrdersCheckToUpload();
            OrdersCheckSuspended();
            
        }, function () {
            //File inesistente, propongo quindi la configurazione
            _qtOrders.orders = [];
            //alert("Nessun ordine memorizzato.");
        }, function (err) {
            //Errore lettura file.
            alert("Errore orders: " + err.message);

        });
    } catch (e) {
        alert("Error Inizializzazione Orders: " + e.message);
    }
}

function OrdersCheckToUploadCount() {
    var uploadOrders = 0;
    if (_qtOrders) {
        if (_qtOrders.orders) {
            for (var i = 0; i < _qtOrders.orders.length; i++) {
                if (_qtOrders.orders[i].orderStatus == ORDER_STATUS.COMPLETED)
                    uploadOrders++;
            }
        }
    }
    return uploadOrders;
}

function OrdersCheckToUpload() {
    /*var uploadOrders = 0;
    if (_qtOrders) {
        if (_qtOrders.orders) {
            for (var i = 0; i < _qtOrders.orders.length; i++) {
                if (_qtOrders.orders[i].orderStatus == ORDER_STATUS.COMPLETED)
                    uploadOrders++;
            }
        }
    }*/
    var uploadOrders = OrdersCheckToUploadCount();

    if (uploadOrders > 0) {
        $("#pageMainOrdToUpload").html(uploadOrders.toString());
        RemoveClassIfExists($("#pageMainOrdToUpload"), "ui-screen-hidden");
    } else {
        AddClassIfMissing($("#pageMainOrdToUpload"), "ui-screen-hidden");
    }

}

function OrdersCheckSuspended() {
    try {

        var suspendedOrders = 0;
        if (_qtOrders) {
            if (_qtOrders.orders) {
                for (var i = 0; i < _qtOrders.orders.length; i++) {
                    if (_qtOrders.orders[i].orderStatus == ORDER_STATUS.NEW)
                        suspendedOrders++;
                }
            }
        }
        if (suspendedOrders > 0) {
            //mostro gli ordini incompleti
            RemoveClassIfExists($("#pageMainOrdIncomplete"), "ui-screen-hidden");

            $("#pageMainOrdList").listview()[0].innerHTML = "";

            var listItemDiv = "<li data-role=\"list-divider\">Ordini Incompleti</li>";
            $("#pageMainOrdList").append(listItemDiv);

            for (var index = 0; index < _qtOrders.orders.length; index++) {
                if (_qtOrders.orders[index].orderStatus == ORDER_STATUS.NEW) {
                    var order = _qtOrders.orders[index];
                    var numRows = 0;
                    if (order.rows)
                        numRows = order.rows.length;

                    var customerStr = "NESSUN CLIENTE"
                    if (order.customerDescr)
                        customerStr = order.customerDescr;

                    var listItem = "<li data-theme=\"b\">" +
                                        "<a href=\"#\" onclick=\"OrderIncompleteOpen('" + order.orderCode + "');\" class=\"ui-alt-icon\"><h2>" + customerStr + "</h2>" +
                                        "<span class=\"ui-li-count\">" + numRows + ((numRows == 1) ? " Riga" : " Righe") + "</span>" +
                                        "<p>Del " + order.orderCode.substring(6, 8) + "/" + order.orderCode.substring(4, 6) + "/" + order.orderCode.substring(0, 4) + " alle " +
                                        order.orderCode.substring(8, 10) + ":" + order.orderCode.substring(10, 12) + "</p></a></li>";
                    $("#pageMainOrdList").append(listItem);
                }
            }

            $("#pageMainOrdList").listview("refresh");


        } else {
            AddClassIfMissing($("#pageMainOrdIncomplete"), "ui-screen-hidden");
        }


    } catch (e) {
        alert("Errore OrdersCheckSuspended: " + e.message);
    }
}

function OrderIncompleteOpen(orderCode) {

    navigator.notification.confirm("Recuperare l'ordine incompleto?",
                                    function (buttonIndex) {
                                        if (buttonIndex == 1) {
                                            for (var index = 0; index < _qtOrders.orders.length; index++) {
                                                if (_qtOrders.orders[index].orderCode == orderCode) {
                                                    _qtOrderWorking = _qtOrders.orders[index].orderCode;
                                                    PageChange("#pageOrder");
                                                }
                                            }
                                        }
                                    },
                                    "Recupero Ordine",
                                    "Si,No");

}

function OrderUploadAll(SuccessCallback, FailCallback, uploadOnlyWorkingOrder) {
    try {
        _qtOrdersUpload = new QTOrderList();

        //Preparo ordini
        for (var index = 0; index < _qtOrders.orders.length; index++) {
            if ((uploadOnlyWorkingOrder && _qtOrders.orders[index].orderCode == _qtOrderWorking) ||
                (!uploadOnlyWorkingOrder)) {
                if (_qtOrders.orders[index].orderStatus == ORDER_STATUS.COMPLETED) {
                    var rows = [];
                    for (var indexR = 0; indexR < _qtOrders.orders[index].rows.length; indexR++) {
                        rows.push(new QTOrderRowUpload(_qtOrders.orders[index].rows[indexR].articleBarcode));
                    }

                    var destCodice = null;
                    if(_qtOrders.orders[index].customerDestData) {
                        destCodice = _qtOrders.orders[index].customerDestData.DestinazioneCodice;
                    }

                    _qtOrdersUpload.orders.push(new QTOrderUpload(_qtOrders.orders[index].orderCode,
                                                                  _qtOrders.orders[index].orderDate,
                                                                  _qtOrders.orders[index].customerCode,
                                                                  destCodice,
                                                                  rows,
                                                                  _qtOrders.orders[index].operatorCode,
                                                                  index));
                }
            }
        }

        //data: JSON.stringify({ "orders": JSON.stringify(_qtOrdersUpload) }),
        //Effettuo l'invio
        $.ajax({
            url: GetServerURL("orders"),
            type: "POST",
            dataType: "jsonp",
            data: JSON.stringify(_qtOrdersUpload),
            success: function (result) {
                if (result.success) {
                    //Rimuovo gli ordini che ho già caricato su server (in ordine inverso per evitare che si modifichino gli index).
                    //for (var index = 0; index < _qtOrdersUpload.orders.length; index++) {
                    for (var index = _qtOrdersUpload.orders.length - 1; index >= 0; index--) {
                        _qtOrders.orders.splice(_qtOrdersUpload.orders[index].orderIndex, 1);
                    }
                    _qtOrdersUpload = null;
                    try {
                        //Salvo su file gli ordini già scaricati su server
                        _qtOrders.saveToFile(function () {
                            //salvataggio temporaneo dell'ordine riuscito.
                            SuccessCallback();
                        }, function (err) {
                            navigator.notification.alert("Errore durante il salvataggio della sincronizzazione degli ordini.\nDettaglio: " + FileGetErrorMessage(err), function () {
                                FailCallback();
                                return;
                            }, "Attenzione", "OK");
                            return;
                        });
                    } catch (e) {
                        alert("Errore JS save ordine: " + e.message);
                        FailCallback();
                    }
                    
                    
                } else {
                    _qtOrdersUpload = null;
                    //navigator.notification.alert("Sincronizzazione ordini fallita.\nDettaglio: " + result.errors.toString(), function () {
                    //    return;
                    //}, "Sincronizzazione Fallita", "OK");
                    FailCallback();
                }
            },
            error: function (xhr, textStatus, textError) {
                alert("Errore upload ordini AJAX: " + textstatus.toString() + " " + textError.toString());
                FailCallback();
            }
        });



    } catch (e) {
        alert("Errore OrderUpload: " + e.message);
        FailCallback();
    }
}


//function ImgDownload() {
//    try {

//        $.ajax({
//            url: "http://192.168.100.39:49219/images/",
//            method: "GET",
//            dataType: "jsonp",
//            beforeSend: function (xhr) {
//                //xhr.setRequestHeader("Authorization", "Basic XXXXXX");
//            },
//            success: function (result) {
//                alert("done");
//                try {
//                    document.getElementById("imgDw").src = "data:image/png;base64," + result.imageCode.toString();
//                } catch (e2) {
//                    alert("e2: " + e2.message);
//                }
//            },
//            error: function (xhr, textStatus, textError) {
//                alert("Error: " + textError + " (" + textStatus + ")");
//            }
//        });



//    } catch (e) {
//        alert("ERR ImgDownload(): " + e.message.toString());
//    }
//}



function pageConfigSaveExecute() {
    try {
        //controlli
        if ($.trim($("#pageOptionsTxtServerIp").val()).length == 0) {
            navigator.notification.alert("Il campo \"Indirizzo IP Server\" non \u00e8 compilato.", function () {
                $("#pageOptionsTxtServerIp").focus();
                return;
            }, "Attenzione", "OK");
            return;
        }

        if ($.trim($("#pageOptionsTxtServerPort").val()).length == 0) {
            navigator.notification.alert("Il campo \"Num. Porta Server\" non \u00e8 compilato.", function () {
                $("#pageOptionsTxtServerPort").focus();
                return;
            }, "Attenzione", "OK");
            return;
        }

        /*if ($.trim($("#pageOptionsTxtQtUser").val()).length == 0) {
            navigator.notification.alert("Il campo \"Nome Operatore in QuickTrade\" non \u00e8 compilato.", function () {
                $("#pageOptionsTxtQtUser").focus();
                return;
            }, "Attenzione", "OK");
            return;
        }*/

        if (!IpAddressIsValid($.trim($("#pageOptionsTxtServerIp").val()))) {
            navigator.notification.alert("Il campo \"Indirizzo IP Server\" non \u00e8 valido.", function () {
                $("#pageOptionsTxtServerIp").focus();
                return;
            }, "Attenzione", "OK");
            return;
        }

        if(isNaN($.trim($("#pageOptionsTxtServerPort").val()))) {
            navigator.notification.alert("Il campo \"Num. Porta Server\" non \u00e8 valido.", function () {
                $("#pageOptionsTxtServerPort").focus();
                return;
            }, "Attenzione", "OK");
            return;
        }

        var portNum = parseInt($.trim($("#pageOptionsTxtServerPort").val()));
        if (portNum <= 0 || portNum > 65535) {
            navigator.notification.alert("Il campo \"Num. Porta Server\" non \u00e8 valido.", function () {
                $("#pageOptionsTxtServerPort").focus();
                return;
            }, "Attenzione", "OK");
            return;
        }
        
        //Salvo
        _qtConfig.ServerIP = $.trim($("#pageOptionsTxtServerIp").val());
        _qtConfig.ServerPortNumber = portNum;
        //_qtConfig.OperatoreCodiceQT = $.trim($("#pageOptionsTxtQtUser").val());

        _qtConfig.saveToFile(function () {
            if (_firstStart) {
                //Al salvataggio della configurazione, se è il primo avvio reinizializzo tutto.
                //Inizializzo la configurazione
                QTConfigInitAndVerify();
                //Leggo anche datasource
                QTDataSourceInitAndVerify();
                //Leggo anche ordini memorizzati
                QTOrderListInitAndVerify();
            }

            _firstStart = false;
            $("#pageMainContent").css("display", "");
            PageChange("#pageMain", true);

        }, function (err) {
            //ERRORE SALVATAGGIO FILE
            var msg = "Non \u00e8 stato possibile salvare la configurazione.\nDettaglio: ";
            if (err.code)
                msg += FileGetErrorMessage(err);
            else
                msg += err.message.toString();

            navigator.notification.alert(msg, function () {
                return;
            }, "Errore", "OK");
        });

    } catch (e) {
        alert("Errore pageConfigSaveExecute: " + e.message);
    }
}

$(document).on("pagebeforeshow", "#pageOptions", function () {
    //Se primo avvio non permetto di tornare indietro
    if (_firstStart) {
        AddClassIfMissing($("#pageOptionsBack"), "ui-disabled");
        $("#pageOptionsDeleteAllDiv").css("display", "none");
    } else {
        RemoveClassIfExists($("#pageOptionsBack"), "ui-disabled");
        $("#pageOptionsDeleteAllDiv").css("display", "");
    }
    //imposto valori
    if (_qtConfig) {
        $("#pageOptionsTxtServerIp").val(_qtConfig.ServerIP);
        $("#pageOptionsTxtServerPort").val(_qtConfig.ServerPortNumber);
        $("#pageOptionsTxtQtUser").val(_qtConfig.OperatoreCodiceQT);
    }
});

$("#pageOptionsSave").click(function () {
    pageConfigSaveExecute();
});

$(document).on("pagecontainerbeforechange", function (event, data) {
    //impedisco di abbandonare la pagina di configurazione durante il primo avvio.
    if (data.prevPage) {
        if (_firstStart && data.prevPage[0].id == "pageOptions") {
            if (data.toPage.toString().indexOf(data.prevPage[0].id) >= 0) {
                //da #pageOptions a #pageOptions
                event.preventDefault();
            } else {
                navigator.notification.alert("E' necessario completare la configurazione iniziale prima di abbandonare la pagina.", function () {
                    event.preventDefault();
                    //il preventDefault() non blocca il cambio di history del browser quindi tento di riportare history in avanti di uno step
                    try { history.forward(); } catch (e) { }
                }, "Attenzione", "OK");

            }
        }
    }
});

function GetServerURL(branchUrl) {
    var url = "http://" + _qtConfig.ServerIP + ":" + _qtConfig.ServerPortNumber + "/";
    if (branchUrl)
        url += branchUrl + "/";
    return url;
}

function ServerOnlineVerify(IsOnline, IsOffline) {
    $.ajax({
        url: GetServerURL("checksystem"),
        method: "GET",
        dataType: "jsonp",
        timeout: 5000,
        success: function (result) {
            IsOnline();
        },
        error: function (xhr, textStatus, textError) {
            IsOffline(textStatus, textError);
        }
    });
}

function SynchronizeDataSource() {
    try {
        //Verifico Online con Server
        navigator.notification.confirm("Avviare la sincronizzazione dati con il server di Quick Trade?",
                                        function (buttonIndex) {
                                            if (buttonIndex == 1) {
                                                //avvio sincronizzazione
                                                LoaderShow("Contatto server...");
                                                ServerOnlineVerify(function () {
                                                    //ONLINE
                                                    var uploadCount = OrdersCheckToUploadCount();
                                                    if (uploadCount > 0) {
                                                        //avvio upload ordini, se ne ho.
                                                        LoaderShow("Upload Ordini...");
                                                        OrderUploadAll(function () {
                                                            //upload ordini riuscito, ora download data source
                                                            SynchronizeDataSourceStart();

                                                        }, function () {
                                                            //fallito
                                                            navigator.notification.alert("Impossibile sincronizzare gli ordini. Sincronizzazione interrotta.", function () {
                                                                return;
                                                            }, "Sincronizzazione fallita", "OK");
                                                        },
                                                        false);
                                                    } else {
                                                        //Scarico subito il datasource
                                                        SynchronizeDataSourceStart();
                                                    }
                                                    
                                                }, function (textStatus, textError) {
                                                    //OFFLINE-ERRORE
                                                    LoaderHide();
                                                    navigator.notification.alert("Il server non \u00e8 raggiungibile, non \u00e8 possibile scaricare i dati.", function () {
                                                        return;
                                                    }, "Attenzione", "OK");
                                                });
                                            }
                                        },
                                        "Sincronizzazione",
                                        "Avvia,Annulla");

        

    } catch (e) {
        LoaderHide();
        alert("Errore SynchronizeDataSource: " + e.message);
    }
}

function SynchronizeDataSourceStart() {
    try {
        //Verifico Online con Server
        LoaderShow("Download in corso...");
        $.ajax({
            url: GetServerURL("datasource"),
            method: "GET",
            dataType: "text",
            success: function (result) {
                
                
                if (result.indexOf("\"errors\"") > -1) {
                    LoaderHide();
                    //errore
                    var pErrors = JSON.parse(result);
                    navigator.notification.alert("Errori durante il download dei dati. Dettaglio: " + pErrors.errors.toString(), function () {
                        return;
                    }, "Sincronizzazione fallita", "OK");
                    return;
                }

                LoaderShow("Analisi dei dati...");
                _qtDS.dataSource = result;
                _qtDS.saveToFile(function () {
                    //Dopo aver scritto reinizializzo il datasource
                    QTDataSourceInitAndVerify(function () {
                        //Successo
                        //LoaderHide(); << Già richiamato
                        navigator.notification.alert("Sincronizzazione con il server completata.", function () {
                            //$("#pageMainPanel").panel("close");
                            PageChange("#pageMain", true);
                            return;
                        }, "Notifica", "OK");

                    });

                }, function (err) {
                    //ERRORE SALVATAGGIO FILE
                    LoaderHide();
                    var msg = "Non e' stato possibile memorizzare il datasource.\nDettaglio: ";
                    if (err.code)
                        msg += FileGetErrorMessage(err);
                    else
                        msg += err.message.toString();

                    navigator.notification.alert(msg, function () {
                        return;
                    }, "Errore", "OK");
                },
                true,
                "Analisi dei dati: [PROGRESS]");

            },
            error: function (xhr, textStatus, textError) {
                LoaderHide();
                navigator.notification.alert("Impossibile completare la memorizzazione del datasource. Sincronizzazione fallita. (" + textStatus.toString() + "," + textError.toString() + ")", function () {
                    return;
                }, "Errore", "OK");
            }
        });

    } catch (e) {
        LoaderHide();
        alert("Errore SynchronizeDataSourceStart: " + e.message);
    }
}

function SynchronizeOrdersList() {
    try {

        var uploadOrders = 0;
        if (_qtOrders) {
            if (_qtOrders.orders) {
                for (var i = 0; i < _qtOrders.orders.length; i++) {
                    if (_qtOrders.orders[i].orderStatus == ORDER_STATUS.COMPLETED)
                        uploadOrders++;
                }
            }
        }

        if (uploadOrders > 0) {
            //mostro gli ordini incompleti
            RemoveClassIfExists($("#pageSyncOrdMissing"), "ui-screen-hidden");

            if(uploadOrders > 1) 
                $("#pageSymcInfo").html("Sono presenti " + uploadOrders.toString() + " ordini da scaricare sul server di Quick Trade.");
            else
                $("#pageSymcInfo").html("E' presente 1 ordine da scaricare sul server di Quick Trade.");


            $("#pageSyncOrdList").listview()[0].innerHTML = "";

            var listItemDiv = "<li data-role=\"list-divider\">Ordini da sincronizzare</li>";
            $("#pageSyncOrdList").append(listItemDiv);

            for (var index = 0; index < _qtOrders.orders.length; index++) {
                if (_qtOrders.orders[index].orderStatus == ORDER_STATUS.COMPLETED) {
                    var order = _qtOrders.orders[index];
                    var numRows = 0;
                    if (order.rows)
                        numRows = order.rows.length;
                    //<a href=\"#\" class=\"ui-alt-icon\"></a>
                    var listItem = "<li data-theme=\"b\" data-icon=\"none\" style=\"background-color: white;\">" +
                                        "<h2>" + order.customerDescr + "</h2>" +
                                        "<span class=\"ui-li-count\">" + numRows + ((numRows == 1) ? " Riga" : " Righe") + "</span>" +
                                        "<p>Del " + order.orderCode.substring(6, 8) + "/" + order.orderCode.substring(4, 6) + "/" + order.orderCode.substring(0, 4) + " alle " +
                                        order.orderCode.substring(8, 10) + ":" + order.orderCode.substring(10, 12) + "</p></li>";
                    $("#pageSyncOrdList").append(listItem);
                }
            }

            $("#pageSyncOrdList").listview("refresh");


        } else {
            AddClassIfMissing($("#pageSyncOrdMissing"), "ui-screen-hidden");
        }


    } catch (e) {
        alert("Errore SynchronizeOrdersList: " + e.message);
    }
}


$(document).on("pageinit", "#pageOrder", function () {
    $(".ui-table-columntoggle-btn").appendTo("#pageOrderTableInfo"); //sposto il bottone "Colonne" della griglia nel fixed header
});


$(document).on("pagebeforeshow", "#pageMain", function () {
    OrdersCheckToUpload();
    OrdersCheckSuspended();
});

$(document).on("pagebeforeshow", "#pageOrder", function () {
    //Creo nuovo oggetto 
    $("#pageOrderRowAdd").val("");
    OrderTableRefresh();
    OrderCustomerApplyStyle();
});

$(document).on("pagebeforeshow", "#pageSync", function () {
    SynchronizeOrdersList();
});


function OrderStartNew() {

    if (!_qtDS.dataSource) {
        navigator.notification.alert("Per poter effettuare una nuova campionatura \u00e8 necessario effettuare la sincronizzazione dati.", function () {
            return;
        }, "Attenzione", "OK");
        return;
    }

    if (!_qtProfile) {
        navigator.notification.alert("Per poter effettuare una nuova campionatura \u00e8 necessario compilare la sezione Profilo.", function () {
            return;
        }, "Attenzione", "OK");
        return;
    }

    if (!_qtProfile.OperatoreCodice) {
        navigator.notification.alert("Per poter effettuare una nuova campionatura \u00e8 necessario compilare la sezione Profilo.", function () {
            return;
        }, "Attenzione", "OK");
        return;
    }

    //Recupero operatore che fa ordine
    var operatoreQT = "";
    if (_qtProfile) {
        operatoreQT = _qtProfile.OperatoreCodice;
    }

    var order = new QTOrder();
    order.operatorCode = operatoreQT;
    _qtOrderWorking = order.orderCode;
    _qtOrders.orders.push(order);
    PageChange("#pageOrder");
}

function pageOrderCancel() {
    //navigator.notification.confirm("Annullare l'inserimento dell'ordine?",
    //                                function (buttonIndex) {
    //                                    if (buttonIndex == 1) {
    //                                        //avvio sincronizzazione
    //                                        var indexDelete = -1;
    //                                        for (var index = 0; index < _qtOrders.orders.length; index++) {
    //                                            if (_qtOrders.orders[index].orderCode == _qtOrderWorking) 
    //                                                indexDelete = index;
    //                                        }
    //                                        if (indexDelete >= 0) 
    //                                            _qtOrders.orders.splice(indexDelete, 1);
    //                                        //_qtOrders.orders.pop();
    //                                        _qtOrderWorking = null;

    //                                        try {
    //                                            //Salvo su file l'ordine che sto compilando (non si sa mai!) Success, Fail
    //                                            _qtOrders.saveToFile(function () {
    //                                                //salvataggio temporaneo dell'ordine riuscito.
    //                                            }, function (err) {
    //                                                navigator.notification.alert("Errore durante il salvataggio temporaneo dell'ordine.\nDettaglio: " + FileGetErrorMessage(err), function () {
    //                                                    return;

    //                                                }, "Attenzione", "OK");
    //                                                return;
    //                                            });
    //                                        } catch (e) {
    //                                            alert("Errore JS save ordine: " + e.message);
    //                                        }

    //                                        PageChange('#pageMain', true);
    //                                    }
    //                                },
    //                                "Attenzione",
    //                                "Si,No");
    navigator.notification.confirm("Annullare l'inserimento dell'ordine?",
                                    function (buttonIndex) {
                                        if (buttonIndex == 1) {

                                            try {

                                                if (_qtOrders.getOrder(_qtOrderWorking)) {
                                                    if ((!_qtOrders.getOrder(_qtOrderWorking).customerCode) && (_qtOrders.getOrder(_qtOrderWorking).rows.length == 0)) {
                                                        //non ho scelto nè cliente ne ho righe quindi non propongo di tenere nulla
                                                        pageOrderCancelExecute(true);
                                                    } else {
                                                        navigator.notification.confirm("Mantenere l'ordine attuale?",
                                                                                        function (buttonIndex) {
                                                                                            var removeOrder = false;
                                                                                            if (buttonIndex != 1) {
                                                                                                removeOrder = true;
                                                                                            }
                                                                                            pageOrderCancelExecute(removeOrder);
                                                                                        },
                                                                                        "Attenzione",
                                                                                        "Si,No");
                                                    }
                                                } else {
                                                    //ordine non valido
                                                    pageOrderCancelExecute(true);
                                                }

                                            } catch (e) {
                                                alert("ERRORE pageOrderCancel: " + e.message);
                                            }

                                            
                                        }
                                    },
                                    "Attenzione",
                                    "Si,No");






    
    












    
}

function pageOrderCancelExecute(removeOrder) {
    try {

        if (removeOrder) {
            //rimuovo l'ordine attuale perchè non va mantenuto
            var indexDelete = -1;
            for (var index = 0; index < _qtOrders.orders.length; index++) {
                if (_qtOrders.orders[index].orderCode == _qtOrderWorking)
                    indexDelete = index;
            }
            if (indexDelete >= 0) {
                _qtOrders.orders.splice(indexDelete, 1);
                //_qtOrders.orders.pop();
            }
        }

        _qtOrderWorking = null;

        try {
            //Salvo su file l'ordine che sto compilando (non si sa mai!) Success, Fail
            _qtOrders.saveToFile(function () {
                //salvataggio temporaneo dell'ordine riuscito.
            }, function (err) {
                navigator.notification.alert("Errore durante il salvataggio temporaneo dell'ordine.\nDettaglio: " + FileGetErrorMessage(err), function () {
                    return;

                }, "Attenzione", "OK");
                return;
            });
        } catch (e) {
            alert("Errore JS save ordine: " + e.message);
        }

        PageChange('#pageMain', true);

    } catch (e) {
        alert("ERRORE pageOrderCancelExecute: " + e.message);
    }
}

function OrderTableRefresh() {
    //table-articles
    try {
        var rows = _qtOrders.getOrder(_qtOrderWorking).rows;
        var html = "";

        if (rows.length == 1)
            $("#pageOrderRowNum").html("1 Riga");
        else 
            $("#pageOrderRowNum").html(rows.length.toString() + " Righe");
        
        for (var i = 0; i < rows.length; i++) {
            html = html + "<tr>" +
                            "<td style=\"vertical-align: middle;\"><a href=\"#\" onclick=\"ListiniShowBarcode('" + rows[i].listinoCorpoObj.ArticoloCodice + "');\">" + rows[i].listinoCorpoObj.ArticoloCodice + "</a></td>" +
                            "<td style=\"vertical-align: middle;\">" + rows[i].baseObj.Descrizione + "</td>" +
                            "<td style=\"vertical-align: middle;\">" + rows[i].listinoCorpoObj.Descrizione + "</td>" +
                            "<td style=\"vertical-align: middle; align: center;\">" +
                                "<a href=\"#\" class=\"ui-shadow ui-btn ui-corner-all ui-btn-icon-notext ui-icon-delete ui-btn-a\" onclick=\"OrderRemoveArticle(" + i.toString() + ");\">Rimuovi</a>" +
                            "</td>" + 
                          "</tr>";
        }

        $("#table-articles > tbody").html(html);
        $("#table-articles").table("refresh");

        $(".pageOrderCtrlGrps").controlgroup("refresh");

    } catch (e) {
        alert("Errore OrderTableRefresh: " + e.message);
    }
}

function OrderRemoveArticle(RowIndex) {
    navigator.notification.confirm("Rimuovere la riga dall'ordine?",
                                    function (buttonIndex) {
                                        if (buttonIndex == 1) {
                                            //rimuovo
                                            _qtOrders.getOrder(_qtOrderWorking).rows.splice(RowIndex, 1);
                                            OrderTableRefresh();
                                            try {
                                                //Salvo su file l'ordine che sto compilando (non si sa mai!) Success, Fail
                                                _qtOrders.saveToFile(function () {
                                                    //salvataggio temporaneo dell'ordine riuscito.
                                                }, function (err) {
                                                    navigator.notification.alert("Errore durante il salvataggio temporaneo dell'ordine.\nDettaglio: " + FileGetErrorMessage(err), function () {
                                                        return;

                                                    }, "Attenzione", "OK");
                                                    return;
                                                });
                                            } catch (e) {
                                                alert("Errore OrderRemoveArticle - tmp save: " + e.message);
                                            }

                                        }
                                        //$('#pageOrderRowAdd').focus();
                                    },
                                    "Cancellazione Riga",
                                    "Si,No");
}

function OrderAddArticle() {
    try {

        var code = $.trim($("#pageOrderRowAdd").val());
        
        //controllo che ci sia un barcode
        if (code.length == 0) {
            navigator.notification.alert("Il campo [Codice] non \u00e8 stato compilato.", function () {
                return;
            }, "Attenzione", "OK");
            return;
        }

        //lo ricerco
        var matches = SEARCHJS.matchArray(_qtDS.dataSource.listiniCorpo, { "ArticoloCodice": code, "Ordine":999 });

        //verifico esito ricerca
        switch (matches.length) {
            case 0:
                //match not found
                navigator.notification.alert("Codice non trovato.", function () {
                    $("#pageOrderRowAdd").val("");
                    return;
                }, "Attenzione", "OK");
                break;

            case 1:
                //match found
                //Verifico che non sia già stato letto il codice
                var alreadyExists = SEARCHJS.matchArray(_qtOrders.getOrder(_qtOrderWorking).rows, { "articleBarcode": code });

                if (alreadyExists.length > 0) {
                    navigator.notification.alert(ConvertToUTF8("Il codice \u00e8 gi\u00e0 stato letto, non verr\u00e0 inserito nuovamente."), function () {
                        alreadyExists = null;
                        $("#pageOrderRowAdd").val("");
                        return;
                    }, "Attenzione", "OK");
                    return;
                }
                alreadyExists = null;

                //Cerco la base
                var matchBase = SEARCHJS.matchArray(_qtDS.dataSource.basi, { "BaseCodice": matches[0].BaseCodice });

                if (matchBase.length == 0) {
                    navigator.notification.alert(ConvertToUTF8("Corrispondenza con la Base non trovata. Il codice letto non verr\u00e0 inserito."), function () {
                        alreadyExists = null;
                        $("#pageOrderRowAdd").val("");
                        return;
                    }, "Attenzione", "OK");
                    return;
                }

                //QTOrderRow(ArticleBarcode, BaseObj, ListinoCorpoObj)
                _qtOrders.getOrder(_qtOrderWorking).rows.push(new QTOrderRow(code, matchBase[0], matches[0]));
                OrderTableRefresh();

                try {
                    //Salvo su file l'ordine che sto compilando (non si sa mai!) Success, Fail
                    _qtOrders.saveToFile(function () {
                        //salvataggio temporaneo dell'ordine riuscito.
                        $("#pageOrderRowAdd").val("");
                        matches = null;

                    }, function (err) {
                        navigator.notification.alert("Errore durante il salvataggio temporaneo dell'ordine.\nDettaglio: " + FileGetErrorMessage(err), function () {
                            $("#pageOrderRowAdd").val("");
                            matches = null;
                            return;

                        }, "Attenzione", "OK");
                        return;
                    });

                }catch(e) {
                    alert("Errore JS save ordine: " + e.message);
                }
                break;

            default:
                //più risultati
                navigator.notification.alert("Il Codice \u00e8 stato trovato, ma risultano " + matches.length.toString() + " corrispondenze.", function () {
                    return;
                }, "Attenzione", "OK");
                break;
        }

    } catch (e) {
        alert("Errore OrderAddArticle: " + e.message);
    }
}

function OrderSave() {
    navigator.notification.confirm("Confermare l'ordine?",
                                    function (buttonIndex) {
                                        if (buttonIndex == 1) {
                                            //salvo
                                            OrderSaveExecute();
                                        }
                                    },
                                    "Salvataggio Ordine",
                                    "Si,No");
}

function OrderSaveExecute() {
    try {
        //controlli
        if (!_qtOrderWorking) {
            navigator.notification.alert("Nessun ordine da salvare.", function () {
                return;
            }, "Attenzione", "OK");
            return;
        }
        if ($.trim(_qtOrderWorking).length == 0) {
            navigator.notification.alert("Nessun ordine da salvare.", function () {
                return;
            }, "Attenzione", "OK");
            return;
        }
        if (!_qtOrders.getOrder(_qtOrderWorking)) {
            navigator.notification.alert("Nessun ordine da salvare.", function () {
                return;
            }, "Attenzione", "OK");
            return;
        }
        if (!_qtOrders.getOrder(_qtOrderWorking).customerCode) {
            navigator.notification.alert("Prima di salvare l'ordine \u00e8 necessario specificare un cliente.", function () {
                return;
            }, "Attenzione", "OK");
            return;
        }
        if (!_qtOrders.getOrder(_qtOrderWorking).rows) {
            navigator.notification.alert("L'ordine \u00e8 senza righe articolo, salvataggio non necessario.", function () {
                return;
            }, "Attenzione", "OK");
            return;
        }
        if (_qtOrders.getOrder(_qtOrderWorking).rows.length == 0) {
            navigator.notification.alert("L'ordine \u00e8 senza righe articolo, salvataggio non necessario.", function () {
                return;
            }, "Attenzione", "OK");
            return;
        }

        //Salvo
        _qtOrders.getOrder(_qtOrderWorking).orderStatus = ORDER_STATUS.COMPLETED;

        try {
            //Salvo su file l'ordine che sto compilando (non si sa mai!) Success, Fail
            _qtOrders.saveToFile(function () {
                //salvataggio dell'ordine dell'ordine riuscito.
                ServerOnlineVerify(function () {
                    //server online
                    OrderUploadAll(function () {
                        //success
                        navigator.notification.alert("Ordine salvato correttamente.", function () {
                            PageChange("#pageMain", true);
                            return;
                        }, "Ordine Sincronizzato", "OK");
                        return;

                    }, function () {
                        //fail
                        PageChange("#pageMain", true);
                        return;
                    },true);

                }, function () {
                    //server offline
                    navigator.notification.alert("Il server di Quick Trade non risulta disponibile. L'ordine \u00e8 stato salvato e dovr\u00e0 essere caricato manualmente in un secondo momento.", function () {
                        PageChange("#pageMain", true);
                        return;
                    }, "Attenzione", "OK");
                    return;
                });

            }, function (err) {
                navigator.notification.alert("Errore durante il salvataggio dell'ordine.\nDettaglio: " + FileGetErrorMessage(err), function () {
                    return;

                }, "Attenzione", "OK");
                return;
            });

        } catch (e) {
            alert("Errore JS save ordine: " + e.message);
        }

    } catch (e) {
        alert("Errore pageConfigSaveExecute: " + e.message);
    }
}

function CancellaTutto() {
    try {
        navigator.notification.confirm("Verranno svuotati tutti i dati relativi a configurazione, articoli, listini, ordini incompleti e profilo.\n\nConfermi di voler cancellare tutto?",
                                        function (buttonIndex) {
                                            if (buttonIndex == 1) {

                                                navigator.notification.confirm("L'operazione di cancellazione \u00e8 irreversibile e l'app diventer\u00e0 inutilizzabile.\n\nVerranno svuotati tutti i dati relativi a configurazione, articoli, listini, ordini incompleti e profilo.\n\nConfermi di voler cancellare tutto?",
                                                                                function (buttonIndex) {
                                                                                    if (buttonIndex == 1) {

                                                                                        navigator.notification.confirm("Confermando verr\u00e0 avviata l'operazione di cancellazione e non sar\u00e0 possibile interromperla.\n\nAvviare la cancellazione di tutti i dati?",
                                                                                                                        function (buttonIndex) {
                                                                                                                            if (buttonIndex == 1) {

                                                                                                                                _qtConfig.deleteFile();
                                                                                                                                _qtDS.deleteFile();
                                                                                                                                _qtOrders.deleteFile();
                                                                                                                                _qtProfile.deleteFile();

                                                                                                                                navigator.notification.alert("Cancellazione completata.\nE' necessario riavviare manualmente l'app.", function () {
                                                                                                                                    PageChange('#pageMain', true);
                                                                                                                                    return;
                                                                                                                                }, "Attenzione", "OK");
                                                                                                                                return;

                                                                                                                            }
                                                                                                                        },
                                                                                                                        "Attenzione",
                                                                                                                        "Si,No");


                                                                                    }
                                                                                },
                                                                                "Attenzione",
                                                                                "Si,No");
                                                
                                                
                                            }
                                        },
                                        "Attenzione",
                                        "Si,No");

        

        
    }catch(e) {
        alert("ERRORE CancellaTutto: " + e.message);
    }
}

$("#pageOptionsDeleteAll").click(function () {
    CancellaTutto();
});

$("#pageOrderRowAdd").keypress(function (event) {
    if (event.which == 13 && $.trim($("#pageOrderRowAdd").val()).length > 0) {
        event.preventDefault();
        OrderAddArticle();
    }
});




$(document).on("pageinit", "#pageCustomer", function () {

    $(".ui-input-clear").css("backgroundColor", "#000");

    //Gestisco download lista clienti
    $("#pageCustomerFilter").keyup(function (event) {
        CustomersFilter($("#pageCustomerFilter").val());
    });

    $("#pageCustomerInfoDest").click(function (event) {
        if (_qtOrders.getOrder(_qtOrderWorking).customerCode) {
            CustomerSelect(_qtOrders.getOrder(_qtOrderWorking).customerCode);
        }
    });

});

$(document).on("pageaftershow", "#pageCustomer", function () {
    $("#pageCustomerInfoCli").listview("refresh");
    $("#pageCustomerInfoDest").listview("refresh");
});


$(document).on("pagebeforeshow", "#pageCustomer", function () {
    if (_qtOrders.getOrder(_qtOrderWorking).customerCode) {
        CustomerChangeView(null, 0);
    } else {
        CustomerChangeView(null, 1);
    }
    CustomerInfoFill();

    
    $("#pageCustomerFilter").val("");
    $("#pageCustomerList").listview()[0].innerHTML = "";



    if (_qtOrders.getOrder(_qtOrderWorking).customerCode) {
        $("#pageCustomerNavbar").show();
    } else {
        $("#pageCustomerNavbar").hide();
    }

});


function CustomerInfoFill() {
    if (_qtOrders.getOrder(_qtOrderWorking).customerCode) {
        //Cliente scelto
        var strInfo = ""; 

        strInfo += "<h2>" + _qtOrders.getOrder(_qtOrderWorking).customerData.RagioneSociale + "</h2><p>";
        strInfo += CustomerDestinationGetInfo(_qtOrders.getOrder(_qtOrderWorking).customerData);
        strInfo += "<br/><br/>Listino: <b>" + _qtOrders.getOrder(_qtOrderWorking).customerData.ListinoCodice + "</b>";
        strInfo += "</p>";
        $("#pageCustomerInfoCli").html(strInfo);

        var destRagSoc = "---";
        if (_qtOrders.getOrder(_qtOrderWorking).customerDestData.RagioneSociale) destRagSoc = _qtOrders.getOrder(_qtOrderWorking).customerDestData.RagioneSociale;
        //tipo destinazione
        var tipoDest = "Non specificato.";
        if (_qtOrders.getOrder(_qtOrderWorking).customerDestData.TipoDestinazione) tipoDest = _qtOrders.getOrder(_qtOrderWorking).customerDestData.TipoDestinazione;

        strInfo = "";
        strInfo += "<h2>" + destRagSoc + "</h2><p>";
        strInfo += CustomerDestinationGetInfo(_qtOrders.getOrder(_qtOrderWorking).customerDestData);
        strInfo += "<br/>Tipo Destinazione: <b>" + tipoDest + "</b></p>";

        $("#pageCustomerInfoDest").html(strInfo);
    }
}

function CustomerChangeView(sender, areaShowIndex) {
    try {
        //se sender è disabilitato non faccio il click
        if(sender) {
            if($(sender).hasClass("ui-disabled")) {
                return;
            }
        }
        
        switch(areaShowIndex) {
            case 0:
                $("#pageCustomerRicerca").hide();
                $("#pageCustomerInfo").show();
                break;
            case 1:
                $("#pageCustomerInfo").hide();
                $("#pageCustomerRicerca").show();
                break;
        }

    }catch(e) {
        alert("Errore CustomerChangeView: " + e.message);
    }
}

function CustomerShowSelect() {
    try {

        /*if (_qtOrders.getOrder(_qtOrderWorking).customerCode) {
            navigator.notification.confirm("E' gi\u00e0 stato scelto un cliente, effettuare comunque la ricerca clienti?",
                                            function (buttonIndex) {
                                                if (buttonIndex == 1) {
                                                    PageChange("#pageCustomer");
                                                }
                                            },
                                            "Attenzione",
                                            "Si,No");
        } else {*/
            PageChange("#pageCustomer");
        //}


    } catch (e) {
        alert("Errore CustomerShowSelect: " + e.message);
    }

}

function CustomersFilter(filterStringValue) {

    //Se la stringa contiene spazi evito di fare richieste
    if ($.trim(filterStringValue).length == 0) {
        return;
    }
    
    $.ajax({
        url: GetServerURL("customers"),
        method: "GET",
        dataType: "jsonp",
        data: { filter: filterStringValue },
        success: function (objResp) {
            try {
                //Gestisco l'errore
                if (objResp.errors) {
                    navigator.notification.alert("La ricerca cliente ha restituito un errore: " + objResp.errors.toString(), function () {
                        return;
                    }, "Attenzione", "OK");
                    return;
                }


                $("#pageCustomerList").listview()[0].innerHTML = "";

                var listItemDiv = "";
                if (filterStringValue == $("#pageCustomerFilter").val()) {
                    listItemDiv = "<li data-role=\"list-divider\">Risultati<span class=\"ui-li-count\">" + objResp.resultCount.toString() + "</span></li>";
                } else {
                    listItemDiv = "<li data-role=\"list-divider\">Cliente Selezionato<span class=\"ui-li-count\">" + objResp.resultCount.toString() + "</span></li>";
                }
                    $("#pageCustomerList").append(listItemDiv);
                
                var bolRows = false;
                if (objResp.result) {
                    if (objResp.result.length > 0) {
                        bolRows = true;
                    }
                }

                if (bolRows) {
                    //elenco risultati
                    _CustomerList = objResp.result;
                    for (var index = 0; index < objResp.result.length; index++) {
                        var customer = objResp.result[index];
                        var listItem = "<li data-theme=\"b\"><a href=\"#\" onclick=\"CustomerSelect('" + customer.AnagraficaCodice + "');\" class=\"ui-alt-icon\"><h2>" + customer.RagioneSociale + "</h2><p>";
                        listItem += CustomerDestinationGetInfo(customer);
                        listItem += "</p></a></li>";
                        $("#pageCustomerList").append(listItem);
                    }
                } else {
                    //mostro troppi/assenza risultati
                    _CustomerList = null;
                    if (objResp.resultCount == 0) {
                        var listItem = "<li disabled=\"disabled\" data-theme=\"c\">Nessun cliente trovato.</li>";
                        $("#pageCustomerList").append(listItem);
                    } else {
                        var listItem = "<li disabled=\"disabled\" data-theme=\"c\">La ricerca ha restituito troppi risultati.</li>";
                        $("#pageCustomerList").append(listItem);
                    }
                }
                
                $("#pageCustomerList").listview("refresh");

            } catch (e) {
                alert("Errore risposta: " + e.message);
            }
        },
        error: function (xhr, textStatus, textError) {
            alert("Errore CustomersFilter AJAX: " + textError + " (" + textStatus + ")");
        }
    });


}

function CustomerDestinationGetInfo(customerObj) {
    //CustomerGetInfo
    var listItem = "";
    if (customerObj.Indirizzo)
        listItem += customerObj.Indirizzo + "<br/>";
    if (customerObj.CAP)
        listItem += customerObj.CAP.toString() + " ";
    if (customerObj.Citta)
        listItem += customerObj.Citta;
    if (customerObj.Provincia)
        listItem += " (" + customerObj.Provincia + ")";
    if (customerObj.NazioneCodice)
        listItem += " - " + customerObj.NazioneCodice;
    return listItem;
}

function CustomerSelect(code) {
    try {
        
        //Devo recuperare la destinazione, se ne ha una il cliente.
        var cntDestinazioni = -1;
        if (_CustomerList) {
            var customers = SEARCHJS.matchArray(_CustomerList, { "AnagraficaCodice": code });
            cntDestinazioni = customers[0].DestinazioniCount;
            customers = null;
        }

        if (cntDestinazioni == 0) {
            CustomerSelectWithDestination(code, null);
        } else {
            CustomerShowDestinations(code);
        }

    }catch(e) {
        alert("Errore CustomerSelect: " + e.message);
    }

}

function CustomerShowDestinations(customerCode) {

    $.ajax({
        url: GetServerURL("customersdestinations"),
        method: "GET",
        dataType: "jsonp",
        data: { anagcode: customerCode },
        success: function (objResp) {
            try {
                //Gestisco l'errore
                if (objResp.errors) {
                    navigator.notification.alert("La ricerca destinazioni ha restituito un errore: " + objResp.errors.toString(), function () {
                        return;
                    }, "Attenzione", "OK");
                    return;
                }


                $("#pageCustomerDestList").listview()[0].innerHTML = "";

                var listItemDiv = "<li data-role=\"list-divider\">Selezione Destinazione Cliente</li>";
                $("#pageCustomerDestList").append(listItemDiv);

                
                    //elenco risultati
                    _CustomerDestinationList = objResp.result;
                    for (var index = 0; index < objResp.result.length; index++) {
                        var destination = objResp.result[index];
                        //Ragione sociale
                        var destRagSoc = "---";
                        if (destination.RagioneSociale) destRagSoc = destination.RagioneSociale;
                        //tipo destinazione
                        var tipoDest = "Non specificato.";
                        if (destination.TipoDestinazione) tipoDest = destination.TipoDestinazione;

                        var listItem = "<li data-theme=\"b\"><a href=\"#\" onclick=\"CustomerSelectWithDestination('" + customerCode + "','" + destination.DestinazioneCodice + "');\" class=\"ui-alt-icon\"><h2>" + destRagSoc + "</h2><p>";
                        listItem += CustomerDestinationGetInfo(destination);
                        listItem += "<br/>Tipo Destinazione: <b>" + tipoDest + "</b>";
                        listItem += "</p></a></li>";
                        $("#pageCustomerDestList").append(listItem);
                    }
                
                    $("#pageCustomerDestList").listview("refresh");

                    $("#pageCustomerPopupDest").popup("open");

            } catch (e) {
                alert("Errore risposta CustomerShowDestinations: " + e.message);
            }
        },
        error: function (xhr, textStatus, textError) {
            alert("Errore CustomerShowDestinations AJAX: " + textError + " (" + textStatus + ")");
        }
    });

}

function CustomerSelectWithDestination(customerCode, destinationCode) {
    try {

        LoaderShow("Selezione Cliente...");

        if (_CustomerList) {
            var customers = SEARCHJS.matchArray(_CustomerList, { "AnagraficaCodice": customerCode });
            _qtOrders.getOrder(_qtOrderWorking).customerCode = customerCode;
            _qtOrders.getOrder(_qtOrderWorking).customerDescr = customers[0].RagioneSociale;
            _qtOrders.getOrder(_qtOrderWorking).customerData = customers[0];
            customers = null;
        }

        if (destinationCode == null) {
            _qtOrders.getOrder(_qtOrderWorking).customerDestData = null;
        } else {
            var destinations = SEARCHJS.matchArray(_CustomerDestinationList, { "DestinazioneCodice": destinationCode });
            _qtOrders.getOrder(_qtOrderWorking).customerDestData = destinations[0];
            destinations = null;
        }

        $("#pageCustomerPopupDest").popup("close");
        
        PageChange("#pageOrder", true);

        _CustomerList = null;
        _CustomerDestinationList = null;


        try {
            //Salvo su file l'ordine che sto compilando (non si sa mai!) Success, Fail
            _qtOrders.saveToFile(function () {
                //salvataggio temporaneo dell'ordine riuscito.
            }, function (err) {
                navigator.notification.alert("Errore durante il salvataggio temporaneo dell'ordine.\nDettaglio: " + FileGetErrorMessage(err), function () {
                    return;

                }, "Attenzione", "OK");
                return;
            });
        } catch (e) {
            alert("Errore CustomerSelectWithDestination - tmp save: " + e.message);
        }


        LoaderHide();

    } catch (e) {
        LoaderHide();
        alert("Errore CustomerSelectWithDestination: " + e.message);
    }
}

function OrderCustomerApplyStyle() {
    if (_qtOrders.getOrder(_qtOrderWorking)) {
        if (_qtOrders.getOrder(_qtOrderWorking).customerCode) {
            $("#pageOrderCliente").buttonMarkup({ theme: 'd' });

            $("#pageOrderCliente").text(_qtOrders.getOrder(_qtOrderWorking).customerDescr + "\n\nListino " + _qtOrders.getOrder(_qtOrderWorking).customerData.ListinoCodice.toString());
            $("#pageOrderCliente").html($("#pageOrderCliente").html().replace(/\n/g, "<br/>"));
        } else {
            $("#pageOrderCliente").buttonMarkup({ theme: 'c' });
            $("#pageOrderCliente").text("Clicca qui per scegliere il Cliente");

        }
    }
}


function StatLoadHitScelte(LineaToLoad) {
    try {

        $.ajax({
            url: GetServerURL("stats/hitscelte"),
            method: "GET",
            dataType: "jsonp",
            data: { linea: LineaToLoad },
            beforeSend: function () {
                LoaderShow("Caricamento...");
                $("#pageHitScelteTitle").html("");
                $("#pageHitScelteTable > tbody").html("");
                $("#pageHitScelteTable").table("refresh");
            },
            success: function (objResp) {
                try {
                    //Gestisco l'errore
                    if (objResp.errors) {
                        navigator.notification.alert("Il caricamento della statistica ha restituito un errore: " + objResp.errors.toString(), function () {
                            return;
                        }, "Attenzione", "OK");
                        return;
                    }

                    $("#pageHitScelteTitle").html(objResp.statDescr);

                    var rows = objResp.result;
                    var html = "";
                    for (var i = 0; i < rows.length; i++) {
                        html = html + "<tr>" +
                                        "<td>" + rows[i].Articolo + "</td>" +
                                        "<td>" + rows[i].Disegno + "</td>" +
                                        "<td>" + rows[i].Qta.toString() + "</td>" +
                                      "</tr>";
                    }

                    $("#pageHitScelteTable > tbody").html(html);
                    $("#pageHitScelteTable").table("refresh");
                    LoaderHide();

                } catch (e) {
                    LoaderHide();
                    alert("Errore StatLoadHitScelte risposta: " + e.message);
                }
            },
            error: function (xhr, textStatus, textError) {
                LoaderHide();
                alert("Errore StatLoadHitScelte AJAX: " + textError + " (" + textStatus + ")");
            }
        });

    } catch (e) {
        LoaderHide();
        alert("Errore StatLoadHitScelte: " + e.message);
    }
}


$(document).on("pagebeforeshow", "#pageHitScelte", function () {
    StatLoadHitScelte("FF");
});


$("#pageHitScelteLoadCT").click(function () {
    StatLoadHitScelte("FF");
});

$("#pageHitScelteLoad2T").click(function () {
    StatLoadHitScelte("2T");
});


$(document).on("pagebeforeshow", "#pageProfile", function () {
    $("#pageListiniContainer").css("display", "none");
    _ProfileInfo = null;
    $("#pageProfileTxtQtUser").val(_qtProfile.OperatoreCodice);

});

$("#pageProfileTxtQtUser").change(function () {
    _ProfileInfo = null;
});

$("#pageProfileVerify").click(function () {
    ProfileOperatorsVerify($("#pageProfileTxtQtUser").val());
});

$("#pageProfileSave").click(function () {
    ProfileSave();
});

function ProfileOperatorsVerify(OperatorCodeToVerify) {
    try {

        $.ajax({
            url: GetServerURL("operators"),
            method: "GET",
            dataType: "jsonp",
            data: { filter: OperatorCodeToVerify },
            beforeSend: function () {
            },
            success: function (objResp) {
                try {
                    //Gestisco l'errore
                    if (objResp.errors) {
                        _ProfileInfo = null;
                        navigator.notification.alert("La verifica dell'operatore \u00e8 fallita a causa di un errore: " + objResp.errors.toString(), function () {
                            return;
                        }, "Attenzione", "OK");
                        return;
                    }

                    if (objResp.operatorFound == true) {
                        _ProfileInfo = new QTProfile();
                        _ProfileInfo.OperatoreCodice = objResp.operatorCode;
                        _ProfileInfo.OperatoreDescrizione = objResp.operatorDesc;
                        navigator.notification.alert("Verifica dell'operatore completata con successo!\n\nDescrizione: " + objResp.operatorDesc, function () {
                            return;
                        }, "Attenzione", "OK");
                        return;

                    } else {
                        _ProfileInfo = null;
                        navigator.notification.alert("Nessun operatore trovato con codice: " + OperatorCodeToVerify.toString(), function () {
                            return;
                        }, "Attenzione", "OK");
                        return;
                    }

                } catch (e) {
                    LoaderHide();
                    alert("Errore StatLoadHitScelte risposta: " + e.message);
                }
            },
            error: function (xhr, textStatus, textError) {
                LoaderHide();
                alert("Errore StatLoadHitScelte AJAX: " + textError + " (" + textStatus + ")");
            }
        });

    } catch (e) {
        LoaderHide();
        alert("Errore StatLoadHitScelte: " + e.message);
    }
}


function ProfileSave() {
    try {
        //controlli
        if ($.trim($("#pageProfileTxtQtUser").val()).length == 0) {
            navigator.notification.alert("Il campo \"Nome Operatore in QuickTrade\" non \u00e8 compilato.", function () {
                $("#pageProfileTxtQtUser").focus();
                return;
            }, "Attenzione", "OK");
            return;
        }

        if (!(_ProfileInfo)) {
            navigator.notification.alert("Il \"Nome Operatore in QuickTrade\" non \u00e8 stato verificato.", function () {
                $("#pageProfileVerify").focus();
                return;
            }, "Attenzione", "OK");
            return;
        }

        //Salvo
        _qtProfile.OperatoreCodice = _ProfileInfo.OperatoreCodice;
        _qtProfile.OperatoreDescrizione = _ProfileInfo.OperatoreDescrizione;

        _qtProfile.saveToFile(function () {

            _ProfileInfo = null;
            PageChange("#pageMain", true);

        }, function (err) {
            //ERRORE SALVATAGGIO FILE
            var msg = "Non \u00e8 stato possibile salvare il profilo.\nDettaglio: ";
            if (err.code)
                msg += FileGetErrorMessage(err);
            else
                msg += err.message.toString();

            navigator.notification.alert(msg, function () {
                return;
            }, "Errore", "OK");
        });

    } catch (e) {
        alert("Errore ProfileSave: " + e.message);
    }
}


function ListiniGetList() {
    try {

        $("#pageListiniListino").find("option").remove().end();

        $.ajax({
            url: GetServerURL("lists"),
            method: "GET",
            dataType: "jsonp",
            success: function (objResp) {
                try {
                    //Gestisco l'errore
                    if (objResp.errors) {
                        _ProfileInfo = null;
                        navigator.notification.alert("Caricamento dell'elenco listini fallito a causa di un errore: " + objResp.errors.toString(), function () {
                            return;
                        }, "Attenzione", "OK");
                        return;
                    }

                    var selIndex = 0;
                    for (var i = 0; i < objResp.result.length; i++) {
                        $("#pageListiniListino").append($("<option>", {
                            text: "Listino: " + objResp.result[i],
                            value: objResp.result[i]
                        }));
                        if (_ListinoViewed) {
                            if (objResp.result[i] == _ListinoViewed.listinoCodice) {
                                selIndex = i;
                            }
                        }
                    }

                    $('#pageListiniListino option')[selIndex].selected = true;
                    $("#pageListiniListino").trigger("change");

                } catch (e) {
                    LoaderHide();
                    alert("Errore ListiniGetList risposta: " + e.message);
                }
            },
            error: function (xhr, textStatus, textError) {
                LoaderHide();
                alert("Errore ListiniGetList AJAX: " + textError + " (" + textStatus + ")");
            }
        });

    } catch (e) {
        LoaderHide();
        alert("Errore ListiniGetList: " + e.message);
    }
}

function ListiniLoadBarcodeInfo() {
    try {

        $.ajax({
            url: GetServerURL("lists/barcode"),
            method: "GET",
            dataType: "jsonp",
            data: { barcode: _ListinoBarcodeToShow, listino: _ListinoShowListinoCodice },
            success: function (objResp) {
                try {

                    //Gestisco l'errore
                    if (objResp.errors) {
                        navigator.notification.alert("La ricerca ha restituito un errore: " + objResp.errors.toString(), function () {
                            return;
                        }, "Attenzione", "OK");
                        return;
                    }

                    _ListinoViewed.baseCodice = objResp.result.baseCodice;
                    _ListinoViewed.baseDesc = objResp.result.baseDesc;
                    _ListinoViewed.gruppo = objResp.result.gruppoCodice;
                    _ListinoViewed.gruppoDesc = objResp.result.gruppoDesc;
                    _ListinoViewed.listinoProgressivo = objResp.result.progCodice;
                    _ListinoViewed.listinoProgressivoDesc = objResp.result.progDesc;
                    _ListinoViewed.objGruppi = objResp.result.objGruppi;

                    _ListinoBarcodeToShow = null;
                    _ListinoShowListinoCodice = null;
                    ListiniDrawDatas();

                } catch (e) {
                    alert("Errore ListiniLoadBarcodeInfo risposta: " + e.message);
                }
            },
            error: function (xhr, textStatus, textError) {
                alert("Errore ListiniLoadBarcodeInfo AJAX: " + textError + " (" + textStatus + ")");
            }
        });


    } catch (e) {
        alert("ERRORE ListiniLoadBarcodeInfo: " + e.message);
    }
}

function ListiniDrawDatas() {
    try {

        LoaderShow("Caricamento...");

        if (!_ListinoViewed) {
            alert("Nessuna informazione da visualizzare.");
            return;
        }
        
        if (_ListinoShowListinoCodice) {
            $("#pageListiniListino").val(_ListinoShowListinoCodice);
            ListiniSetListino(_ListinoShowListinoCodice);
        }

        if (_ListinoBarcodeToShow) {
            ListiniLoadBarcodeInfo();
            return;
        } 


        if (_ListinoViewed.baseCodice) {
            //$("#pageListiniBase").text("Base\n" + _ListinoViewed.baseDesc);
            $("#pageListiniBase").text("Cambia Base");
            $("#pageListiniBase").html($("#pageListiniBase").html().replace(/\n/g, "<br/>"));
            $("#pageListiniBaseDiv").show();
        } else {
            $("#pageListiniBaseDiv").hide();
        }


        
        var showGruppo = false;
        //Mostro il bottone "Cambia Gruppo" solo quando ho più di un gruppo.        
        if (_ListinoViewed.gruppo) {
            if(_ListinoViewed.objGruppi) {
                if(_ListinoViewed.objGruppi.length > 1) {
                    showGruppo = true;
                }
            } else {
                showGruppo = true;
            }
        } 
        if (showGruppo) {
            
            //$("#pageListiniGruppo").text("Gruppo\n" + _ListinoViewed.gruppoDesc);
            $("#pageListiniGruppo").text("Cambia Gruppo");
            $("#pageListiniGruppo").html($("#pageListiniGruppo").html().replace(/\n/g, "<br/>"));
            $("#pageListiniGruppoDiv").show();
        } else {
            $("#pageListiniGruppoDiv").hide();
        }


        /*if (_ListinoViewed.listinoProgressivo) {
            $("#pageListiniArticolo").text("Articolo\n" + _ListinoViewed.listinoProgressivoDesc);
            $("#pageListiniArticolo").html($("#pageListiniArticolo").html().replace(/\n/g, "<br/>"));
            $("#pageListiniArticoloDiv").show();
        } else {
            $("#pageListiniArticoloDiv").hide();
        }*/



        if (_ListinoViewed.baseCodice && _ListinoViewed.gruppo) { // && _ListinoViewed.listinoProgressivo) {
            //filtrato tutto, mostro prezzi
            //ListiniMostraPrezzi();
            ListiniLoadListView();
            $("#pageListiniSearch").hide();
            $("#pageListiniPrezzi").show();
        } else {
            //devo completare i filtri, mostro listview
            ListiniLoadListView();
            if (_ListinoViewed.baseCodice) {
                $("#pageListiniSearchArea").hide();
            } else {
                $("#pageListiniSearchArea").show();
            }
            $("#pageListiniPrezzi").hide();
            $("#pageListiniSearch").show();
        }


    } catch (e) {
        alert("ERRORE ListiniDrawDatas: " + e.message);
    }
}

function ListiniLoadListView() {
    try {
        ////se ho sia base che gruppo devo mostrare gli articoli del gruppo (già scaricati), evito di proseguire nella function
        //if (_ListinoViewed.baseCodice && _ListinoViewed.gruppo) {
        //    ListiniLoadArticoliGruppo();
        //    return;
        //}

        //risorsa da interrogare
        var httpReq = "";
        if (!_ListinoViewed.baseCodice) {
            httpReq = "lists/basi";
        } else { // if (!_ListinoViewed.gruppo) {
            httpReq = "lists/groups";
        }
        //filtro da passare
        var filter = null;
        if (!_ListinoViewed.baseCodice) {
            filter = { filter: $("#pageListiniSearchField").val().toString() };
        } else {
            filter = { base: _ListinoViewed.baseCodice.toString(), listino: $("#pageListiniListino").val() };
        }

        $.ajax({
            url: GetServerURL(httpReq),
            method: "GET",
            dataType: "jsonp",
            data: filter,
            success: function (objResp) {
                try {

                    //Gestisco l'errore
                    if (objResp.errors) {
                        navigator.notification.alert("La ricerca ha restituito un errore: " + objResp.errors.toString(), function () {
                            return;
                        }, "Attenzione", "OK");
                        return;
                    }

                    if (!_ListinoViewed.baseCodice) {
                        //############################################
                        //## CARICO ELENCO BASI (filtrato da utente)
                        //############################################

                        $("#pageListiniListView").listview()[0].innerHTML = "";

                        listItemDiv = "<li data-role=\"list-divider\">Basi Trovate<span class=\"ui-li-count\">" + objResp.resultCount.toString() + "</span></li>";
                        $("#pageListiniListView").append(listItemDiv);

                        var bolRows = false;
                        if (objResp.result) {
                            if (objResp.result.length > 0) {
                                bolRows = true;
                            }
                        } 

                        if (bolRows) {
                            //elenco risultati
                            _CustomerList = objResp.result;
                            for (var index = 0; index < objResp.result.length; index++) {
                                var item = objResp.result[index];
                                var listItem = "<li data-theme=\"b\"><a href=\"#\" onclick=\"ListiniSelectBase('" + item.BaseCodice + "', '" + item.Descrizione.replace(/\'/g, '') + "');\" class=\"ui-alt-icon\"><h2>" + item.Descrizione + "</h2></a></li>";
                                $("#pageListiniListView").append(listItem);
                            }
                        } else {
                            //mostro troppi/assenza risultati
                            if (objResp.resultCount == 0) {
                                var listItem = "<li disabled=\"disabled\" data-theme=\"c\">Nessuna base trovata.</li>";
                                $("#pageListiniListView").append(listItem);
                            } else {
                                var listItem = "<li disabled=\"disabled\" data-theme=\"c\">La ricerca ha restituito troppi risultati.</li>";
                                $("#pageListiniListView").append(listItem);
                            }
                        }


                    } else {

                        var bolRows = false;
                        if (objResp.result) {
                            if (objResp.result.length > 0) {
                                bolRows = true;
                            }
                        }
                        if (bolRows) {
                            _ListinoViewed.objGruppi = objResp.result;
                        }

                        if (!_ListinoViewed.gruppo) {
                            //############################################
                            //## CARICO ELENCO GRUPPI 
                            //############################################
                            //Se ho un solo gruppo vado ad autoselezionarlo
                            if (!bolRows) {
                                navigator.notification.alert("La base scelta non ha un listino prezzi.", function () {
                                    _ListinoViewed.baseCodice = null;
                                    _ListinoViewed.baseDesc = null;
                                    ListiniDrawDatas();
                                    return;
                                }, "Attenzione", "OK");
                                return;
                            }

                            $("#pageListiniListView").listview()[0].innerHTML = "";

                            if (objResp.result.length == 1) {
                                ListiniSelectGruppo(objResp.result[0].Gruppo, objResp.result[0].Descrizione);
                                return;
                            }

                            listItemDiv = "<li data-role=\"list-divider\">Gruppi<span class=\"ui-li-count\">" + objResp.resultCount.toString() + "</span></li>";
                            $("#pageListiniListView").append(listItemDiv);

                            if (bolRows) {
                                //elenco risultati
                                for (var index = 0; index < objResp.result.length; index++) {
                                    var item = objResp.result[index];
                                    var listItem = "<li data-theme=\"b\"><a href=\"#\" onclick=\"ListiniSelectGruppo('" + item.Gruppo + "', '" + item.Descrizione.replace(/\'/g, '') + "');\" class=\"ui-alt-icon\"><h2>" + item.Descrizione + "</h2></a></li>";
                                    $("#pageListiniListView").append(listItem);
                                }
                            } else {
                                //assenza risultati
                                var listItem = "<li disabled=\"disabled\" data-theme=\"c\">Nessun gruppo presente.</li>";
                                $("#pageListiniListView").append(listItem);
                            }

                        } else {

                            //se ho sia base che gruppo devo mostrare gli articoli del gruppo (già scaricati), evito di proseguire nella function
                            if (_ListinoViewed.baseCodice && _ListinoViewed.gruppo) {
                                ListiniLoadArticoliGruppo();
                                return;
                            }

                        }
                    }

                    $("#pageListiniListView").listview("refresh");

                    $.mobile.silentScroll(0);

                    //alert("ListiniLoadListView display");
                    $("#pageListiniContainer").css("display", "");

                    LoaderHide();

                } catch (e) {
                    alert("Errore risposta: " + e.message);
                }
            },
            error: function (xhr, textStatus, textError) {
                alert("Errore ListiniLoadListView AJAX: " + textError + " (" + textStatus + ")");
            }
        });

    } catch (e) {
        alert("ERRORE ListiniLoadListView: " + e.message);
    }
}

function ListiniLoadArticoliGruppo() {
    try {
        //############################################
        //## CARICO ELENCO ARTICOLI GRUPPO
        //############################################
        var itemToUse = null;
        var bolRows = false;
        for (var index = 0; index < _ListinoViewed.objGruppi.length; index++) {
            if (_ListinoViewed.objGruppi[index].BaseCodice == _ListinoViewed.baseCodice) {
                itemToUse = _ListinoViewed.objGruppi[index];
            }
        }

        var html = "";

        if (itemToUse) {

            $("#pageListiniPrezziTitle").html(_ListinoViewed.baseDesc + " <img src=\"img/arr_right.png\"/> " + _ListinoViewed.gruppoDesc);
                                                                          
            for (var index = 0; index < itemToUse.Articoli.length; index++) {
                var item = itemToUse.Articoli[index];
                var descr = "&nbsp;";
                if (item.Descrizione) {
                    descr = item.Descrizione;
                }
                
                if (item.Prezzi) {

                    for (var indexPz = 0; indexPz < item.Prezzi.length; indexPz++) {
                        html = html + "<tr><td>" + descr + "</td><td>" + item.Prezzi[indexPz].price + "</td><td>" + IIF(item.Prezzi[indexPz].finoA == "0", "&nbsp;", item.Prezzi[indexPz].finoA) + "</td></tr>";
                    }

                } else {
                    //articolo senza prezzi
                    html = html + "<tr><td>" + descr + "</td><td colspan=\"2\" style=\"text-align: center;\">Nessun prezzo disponibile.</td></tr>";
                }
            }
        } else {
            html = html + "<tr><td colspan=\"3\" style=\"text-align: center;\">Nessun articolo disponibile.</td></tr>";
        }

        $("#pageListiniTablePrezzi > tbody").html(html);
        $("#pageListiniTablePrezzi").table("refresh");

        $.mobile.silentScroll(0);

        $("#pageListiniContainer").css("display", "");

        LoaderHide();

    } catch (e) {
        alert("ERRORE ListiniLoadArticoliGruppo: " + e.message);
    }
}


//function ListiniMostraPrezzi() {
//    try {

//        $.ajax({
//            url: GetServerURL("lists/prices"),
//            method: "GET",
//            dataType: "jsonp",
//            data: { base: _ListinoViewed.baseCodice, prog: _ListinoViewed.listinoProgressivo, listino: _ListinoViewed.listinoCodice },
//            success: function (objResp) {
//                try {

//                    //Gestisco l'errore
//                    if (objResp.errors) {
//                        navigator.notification.alert("La ricerca ha restituito un errore: " + objResp.errors.toString(), function () {
//                            return;
//                        }, "Attenzione", "OK");
//                        return;
//                    }

//                    var html = "";

//                    if (objResp.result) {
//                        //Mostro elenco prezzi
//                        for (var i = 0; i < objResp.result.length; i++) {
//                            html = html + "<tr>" +
//                                            "<td>" + objResp.result[i].finoA + "</td>" +
//                                            "<td>" + objResp.result[i].price + "</td>" +
//                                          "</tr>";
//                        }
//                    } else {
//                        //Nessun prezzo trovato
//                        html = "<tr>" +
//                                    "<td colspan=\"2\" style=\"text-align: center;\">Nessun prezzo disponibile.</td>" +
//                               "</tr>";

//                    }
//                    $("#pageListiniTablePrezzi > tbody").html(html);
//                    $("#pageListiniTablePrezzi").table("refresh");


//                    $("#pageListiniContainer").css("display", "");


//                    LoaderHide();

//                } catch (e) {
//                    alert("Errore ListiniMostraPrezzi risposta: " + e.message);
//                }
//            },
//            error: function (xhr, textStatus, textError) {
//                alert("Errore CustomersFilter AJAX: " + textError + " (" + textStatus + ")");
//            }
//        });


//    } catch (e) {
//        alert("ERRORE ListiniMostraPrezzi: " + e.message);
//    }
//}


$("#pageListiniBase").click(function() {
    _ListinoViewed.baseCodice = null;
    _ListinoViewed.baseDesc = null;
    _ListinoViewed.gruppo = null;
    _ListinoViewed.gruppoDesc= null;
    _ListinoViewed.listinoProgressivo = null;
    _ListinoViewed.listinoProgressivoDesc = null;
    ListiniDrawDatas();
});

$("#pageListiniGruppo").click(function () {
    _ListinoViewed.gruppo = null;
    _ListinoViewed.gruppoDesc = null;
    _ListinoViewed.listinoProgressivo = null;
    _ListinoViewed.listinoProgressivoDesc = null;
    ListiniDrawDatas();
    ListiniDrawDatas();
});

$("#pageListiniArticolo").click(function () {
    _ListinoViewed.listinoProgressivo = null;
    _ListinoViewed.listinoProgressivoDesc = null;
    ListiniDrawDatas();
});

$("#pageListiniBack").click(function () {

    navigator.notification.confirm("Abbandonare la schermata del listino prezzi?",
                                    function (buttonIndex) {
                                        if (buttonIndex == 1) {
                                            PageChange('', true);                                            
                                        }
                                    },
                                    "Indietro",
                                    "Si,No");

});

function ListiniSelectBase(strBaseCodice, strDescrizione) {
    _ListinoViewed.baseCodice = strBaseCodice;
    _ListinoViewed.baseDesc = strDescrizione;
    ListiniDrawDatas();
}

function ListiniSelectGruppo(strGruppo, strDescrizione) {
    try {
        _ListinoViewed.gruppo = strGruppo;
        _ListinoViewed.gruppoDesc = strDescrizione;
        ListiniDrawDatas();
    }catch(e) {
        alert("ERRORE ListiniSelectGruppo: " + e.message);
    }
}

//function ListiniSelectArticolo(strProgressivo, strDescrizione) {
//    _ListinoViewed.listinoProgressivo = strProgressivo;
//    _ListinoViewed.listinoProgressivoDesc = strDescrizione;
//    ListiniDrawDatas();
//}


$(document).on("pageinit", "#pageListini", function () {

    $(".ui-input-clear").css("backgroundColor", "#000");

    $("#pageListiniSearchField").keyup(function (event) {
        ListiniLoadListView();
    });
});

$(document).on("pagebeforeshow", "#pageListini", function () {

    $("#pageListiniContainer").css("display", "none");
    ListiniGetList();
});

function ListiniInitializeNewClass() {
    //if (!_ListinoViewed) {
        //inizializzo l'oggetto
        _ListinoViewed = new QTListinoViewed(null, null, null, null, null, null, null, null);
    //}
}

function ListiniShowPage() {
    //svuoto variabili
    ListiniInitializeNewClass();
    _ListinoBarcodeToShow = null;
    _ListinoShowListinoCodice = null;

    $("#pageListiniListinoDiv").css("display", "");
    $("#pageListiniSearchField").val("");
    PageChange('#pageListini');
}

function ListiniShowBarcode(barcodeString) {
    try {
        if (!_qtOrderWorking) {
            navigator.notification.alert("Nessun ordine in acquisizione.", function () {
                return;
            }, "Attenzione", "OK");
            return;
        }

        if (!_qtOrders.getOrder(_qtOrderWorking).customerCode) {
            navigator.notification.alert("E' necessario scegliere un cliente per poter visualizzare il listino prezzi.", function () {
                return;
            }, "Attenzione", "OK");
            return;
        }

        if (!_qtOrders.getOrder(_qtOrderWorking).customerData.ListinoCodice) {
            navigator.notification.alert("Il cliente non dispone di un listino valido per poter visualizzare il listino prezzi.", function () {
                return;
            }, "Attenzione", "OK");
            return;
        }


        ListiniInitializeNewClass();
        _ListinoBarcodeToShow = barcodeString;
        _ListinoShowListinoCodice = _qtOrders.getOrder(_qtOrderWorking).customerData.ListinoCodice;

        $("#pageListiniListinoDiv").css("display", "none");
        $("#pageListiniSearchField").val("");
        PageChange('#pageListini');

    } catch (e) {
        alert("ERRORE ListiniShowBarcode: " + e.message);
    }
}

function ListiniSetListino(ListinoCodice) {
    try {
        _ListinoViewed.listinoCodice = ListinoCodice;
        $("#pageListiniTablePrezzoPrezzo").text("Prezzo " + _ListinoViewed.listinoCodice);
    } catch (e) {
        alert("ERRORE ListiniSetListino: " + e.message);
    }
}

$("#pageListiniListino").change(function () {
    try {
        //imposto il listino selezionato e forzo il ricalcolo dei prezzi (se è necessario)
        ListiniSetListino($("#pageListiniListino").val());
        ListiniDrawDatas();
    } catch (e) {
        alert("ERRORE pageListiniListino change: " + e.message);
    }
});



