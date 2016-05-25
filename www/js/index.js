//25/5/2016 release

//DANIELE BARLOCCO 29/4/2016
//Variabile per retrocompatibilit� listini ONLINE/OFFLINE

var FUNZIONAMENTO_OFFLINE = true;

/*
escluse dalla logica online le seguenti 2 funzioni:
ListiniLoadBarcodeInfo
ListiniLoadListView
*/

var NR_MASSIMO_ORDINI_VISUALIZZABILI = 200;

var _artSelezGuidata = null;
var _pageOrder_TipoArticoloSelezionato = "TP";


var _qtConfig = null;
var _qtDS = null; 1
var _firstStart = false;
var _qtOrders = null;
var _qtOrderWorking = null;             //CODICE DELL' ORDINE IN LAVORO
var _qtProfile = null;
//var _stringValue = null;
var _CustomerList = null;
var _CustomerDestinationList = null;
var _qtOrdersUpload = null;
var _ProfileInfo = null;
var _ListinoViewed = null;
var _ListinoBarcodeToShow = null;
var _ListinoShowListinoCodice = null;


var CONTATTO_NOTE_ALLOWED_CHARS = " 0123456789abcdefghijklmnopqrstuvwxyz.:,;!()����@�-_+$/";

//VERSIONE VISUALIZZATA A SCHERMO
var APP_VERSION = "1.1";

var app = {



    // Application Constructor
    initialize: function () {
        this.bindEvents();
    },
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    onDeviceReady: function () {

        //LoaderShow("Benvenuto!");
        //Sistemo la status bar
        try {
            if (StatusBar) {
                try {
                    StatusBar.overlaysWebView(false);
                    StatusBar.styleBlackOpaque();
                    StatusBar.backgroundColorByHexString("#fdbf44");
                } catch (e) {
                    alert("StatusBar: " + e.message);
                }
            } else {
                alert("StatusBar: non esiste l'oggetto.");
            }
        } catch (e) {
            alert("ERRORE onDeviceReady StatusBar: " + e.message);
        }

        //Mostro versione APP
        $("#pageMainPanelVersion").html("Versione <b>" + APP_VERSION + "</b><br/>&copy; Net Systems");


        //Inizializzo la configurazione
        QTConfigInitAndVerify();

        // alert("_qtProfile.OperatorePassword: " + _qtProfile.OperatorePassword);

        //Leggo anche profilo
        QTProfileInitAndVerify();

        //Leggo anche datasource
        QTDataSourceInitAndVerify();

        //Leggo anche ordini memorizzati
        QTOrderListInitAndVerify();

        //La riga qui sotto viene spostata nella funzione che carica il file pi� pesante: QTDataSourceInitAndVerify
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
            _qtProfile.OperatorePassword = _readConfig.OperatorePassword;

        }, function () {
            //File inesistente, propongo quindi la configurazione
            _qtProfile.OperatoreCodice = "";
            _qtProfile.OperatoreDescrizione = "";
            _qtProfile.OperatorePassword = "";

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
            $("#pageMainHeaderNavBar").css("display", "");

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


            /*Daniele Barlocco - retrocompatibilita ordini - INIZIO*/
            var richiestoSalvataggio = false;
            if (_qtOrders.orders) {
                for (var i = 0; i < _qtOrders.orders.length; i++) {
                    var o = _qtOrders.orders[i];

                    if (!o.orderEMail) { o.orderEMail = ""; richiestoSalvataggio = true; }

                    if (!o.operatorCode) { o.operatorCode = _qtProfile.OperatoreCodice; richiestoSalvataggio = true; }
                    if (!o.operatorPassword) { o.operatorPassword = _qtProfile.OperatorePassword; richiestoSalvataggio = true; }

                    for (var j = 0; j < o.rows.length; j++) {
                        var r = o.rows[j];
                        if (!r.Qta) { r.Qta = 1; richiestoSalvataggio = true; }
                        if (!r.OggettoCodice) { r.OggettoCodice = "TP"; richiestoSalvataggio = true; }
                    }
                }
            }

            if (richiestoSalvataggio == true) {
                _qtOrders.saveToFile(function () {
                    //salvataggio temporaneo dell'ordine riuscito.
                }, function (err) {
                    navigator.notification.alert("Errore durante il salvataggio temporaneo dell'ordine.\nDettaglio: " + FileGetErrorMessage(err), function () {
                        return;
                    }, "Attenzione", "OK");
                    return;
                });
            }
            /*Daniele Barlocco - retrocompatibilita ordini - FINE*/


            //verifico se ho ordini salvati in sospeso o se ho ordini salvati da uploadare
            OrdersCheckToUpload();
            OrdersCheckList();

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

    var uploadOrders = OrdersCheckToUploadCount();

    if (uploadOrders > 0) {
        $("#pageMainOrdToUpload").html(uploadOrders.toString());
        RemoveClassIfExists($("#pageMainOrdToUpload"), "ui-screen-hidden");
    } else {
        AddClassIfMissing($("#pageMainOrdToUpload"), "ui-screen-hidden");
    }

}








/*VISUALIZZA ELENCO DEGLI ORDINI TRASFERITI*/
function OrdersCheckList_trasferiti(troppiOrdini) {
    try {

        //alert("troppiOrdini " + troppiOrdini);

        if (!_qtOrders) {
            return;
        }


        if (!_qtOrders.orders) {
            return;
        }




        /*DANIELE BARLOCCO 12/5/2016  AGGIUNTI ORDINI TRASFERITI*/


        var ordiniDaVisualizzare_liv1 = null;
        var ordiniDaVisualizzare_liv2 = null;
        var lista = null;

        if (troppiOrdini == true) {
            var filter = $("#pageMainOrdList_Trasferiti_Filter").val().toString();


            ordiniDaVisualizzare_liv1 = SEARCHJS.matchArray(_qtOrders.orders, { "orderStatus": ORDER_STATUS.TRASFERITO });
            ordiniDaVisualizzare_liv2 = SEARCHJS.matchArray(ordiniDaVisualizzare_liv1, { _join: "OR", _text: "true", "customerDescr": filter, "orderCode": filter, "orderDateTransfer_PerUtente": filter, "rows.length": filter });

            lista = $("#pageMainOrdList_Trasferiti_dinamico");

        } else {
            ordiniDaVisualizzare_liv1 = SEARCHJS.matchArray(_qtOrders.orders, { "orderStatus": ORDER_STATUS.TRASFERITO });
            ordiniDaVisualizzare_liv2 = ordiniDaVisualizzare_liv1;
            lista = $("#pageMainOrdList_Trasferiti");
        }

        //alert("ordiniDaVisualizzare_liv1.length " + ordiniDaVisualizzare_liv1.length);
        //alert("ordiniDaVisualizzare_liv2.length " + ordiniDaVisualizzare_liv2.length);
        if (!ordiniDaVisualizzare_liv2) {
            return;
        }

        $("#pageMainOrdList_Trasferiti").listview()[0].innerHTML = "";
        $("#pageMainOrdList_Trasferiti_dinamico").listview()[0].innerHTML = "";




        var listItemDiv_trasf = "<li data-role=\"list-divider\">Ordini trasferiti<span class=\"ui-li-count\">" + ordiniDaVisualizzare_liv2.length.toString() + "</span></li>";
        lista.append(listItemDiv_trasf);



        if (ordiniDaVisualizzare_liv2.length == 0) {
            lista.append("<li data-theme=\"b\"><a href=\"#\"><h2><i>Nessun ordine trovato.</i></h2></a></li>");
        } else if (ordiniDaVisualizzare_liv2.length > NR_MASSIMO_ORDINI_VISUALIZZABILI) {
            lista.append("<li data-theme=\"b\"><a href=\"#\"><h2><i>La ricerca ha restituito troppi risultati.</i></h2></a></li>");
        } else {
            for (var index = 0; index < ordiniDaVisualizzare_liv2.length; index++) {
                var order_trasf = ordiniDaVisualizzare_liv2[index];

                var numRows = 0;
                if (order_trasf.rows)
                    numRows = order_trasf.rows.length;

                var customerStr_trasf = "NESSUN CLIENTE"
                if (order_trasf.customerDescr) {customerStr_trasf = order_trasf.customerDescr;}


                 var msgCodiceTrasferimento = "";
                if (order_trasf.orderCode_PerCliente) { msgCodiceTrasferimento = " - Ordine di riferimento per il cliente: " + order_trasf.orderCode_PerCliente ;   }


                var listItem = "<li data-theme=\"b\" data-icon=\"eye\">" +
                                "<a href=\"#\" onclick=\"OrderOpen('" + order_trasf.orderCode + "');\" class=\"ui-alt-icon\"><h2>" + customerStr_trasf + "</h2>" +
                                "<span class=\"ui-li-count\">" + numRows + ((numRows == 1) ? " Riga" : " Righe") + "</span>" +
                                "<p>Del " + order_trasf.orderCode.substring(6, 8) + "/" + order_trasf.orderCode.substring(4, 6) + "/" + order_trasf.orderCode.substring(0, 4) + " alle " + order_trasf.orderCode.substring(8, 10) + ":" + order_trasf.orderCode.substring(10, 12) + "</p>" +
                                "<p><b>Data di trasferimento: " + order_trasf.orderDateTransfer_PerUtente + msgCodiceTrasferimento +  "</b></p>" +
                                "</a></li>";

                lista.append(listItem);


            }
        }

        lista.listview("refresh");


    } catch (e) {
        alert("Errore OrdersCheckList_trasferiti: " + e.message);
    }

}

/*VISUALIZZA ELENCO DEGLI ORDINI*/
function OrdersCheckList() {
    try {


        if (!_qtOrders) {
            AddClassIfMissing($("#pageMainOrdIncomplete"), "ui-screen-hidden");
            return;
        }


        if (!_qtOrders.orders) {
            AddClassIfMissing($("#pageMainOrdIncomplete"), "ui-screen-hidden");
            return;
        }



        RemoveClassIfExists($("#pageMainOrdIncomplete"), "ui-screen-hidden");
        $("#pageMainOrdList").listview()[0].innerHTML = "";

        //mostro gli ordini incompleti
        var ordini_nuovi = SEARCHJS.matchArray(_qtOrders.orders, { "orderStatus": ORDER_STATUS.NEW });
        var listItemDiv = "<li data-role=\"list-divider\">Ordini in lavoro<span class=\"ui-li-count\">" + ordini_nuovi.length.toString() + "</span></li>";

        $("#pageMainOrdList").append(listItemDiv);
        if (ordini_nuovi.length == 0) {
            $("#pageMainOrdList").append("<li data-theme=\"b\"><a href=\"#\"><h2><i>Nessun ordine</i></h2></a></li>");
        } else {

            for (var index = 0; index < ordini_nuovi.length; index++) {
                var order = ordini_nuovi[index];

                var numRows = 0;
                if (order.rows)
                    numRows = order.rows.length;

                var customerStr = "NESSUN CLIENTE"
                if (order.customerDescr)
                    customerStr = order.customerDescr;

                var listItem = "<li data-theme=\"b\">" +
                                    "<a href=\"#\" onclick=\"OrderOpen('" + order.orderCode + "');\" class=\"ui-alt-icon\"><h2>" + customerStr + "</h2>" +
                                    "<span class=\"ui-li-count\">" + numRows + ((numRows == 1) ? " Riga" : " Righe") + "</span>" +
                                    "<p>Del " + order.orderCode.substring(6, 8) + "/" + order.orderCode.substring(4, 6) + "/" + order.orderCode.substring(0, 4) + " alle " +
                                    order.orderCode.substring(8, 10) + ":" + order.orderCode.substring(10, 12) + "</p></a></li>";
                $("#pageMainOrdList").append(listItem);
            }
        }




        //mostro gli ordini confermati, ma non inviati
        var ordini_confermati = SEARCHJS.matchArray(_qtOrders.orders, { "orderStatus": ORDER_STATUS.COMPLETED });
        var listItemDiv = "<li data-role=\"list-divider\">Ordini da trasferire<span class=\"ui-li-count\">" + ordini_confermati.length.toString() + "</span></li>";
        $("#pageMainOrdList").append(listItemDiv);

        if (ordini_confermati.length == 0) {
            $("#pageMainOrdList").append("<li data-theme=\"b\"><a href=\"#\"><h2><i>Nessun ordine</i></h2></a></li>");
        } else {

            for (var index = 0; index < ordini_confermati.length; index++) {
                var order = ordini_confermati[index];

                var numRows = 0;
                if (order.rows)
                    numRows = order.rows.length;

                var customerStr = "NESSUN CLIENTE"
                if (order.customerDescr)
                    customerStr = order.customerDescr;

                var listItem = "<li data-theme=\"b\" data-icon=\"edit\">" +
                                    "<a href=\"#\" onclick=\"OrderOpen('" + order.orderCode + "');\" class=\"ui-alt-icon\"><h2>" + customerStr + "</h2>" +
                                    "<span class=\"ui-li-count\">" + numRows + ((numRows == 1) ? " Riga" : " Righe") + "</span>" +
                                    "<p>Del " + order.orderCode.substring(6, 8) + "/" + order.orderCode.substring(4, 6) + "/" + order.orderCode.substring(0, 4) + " alle " +
                                    order.orderCode.substring(8, 10) + ":" + order.orderCode.substring(10, 12) + "</p></a></li>";
                $("#pageMainOrdList").append(listItem);
            }
        }


        $("#pageMainOrdList").listview("refresh");


    } catch (e) {
        alert("Errore OrdersCheckList: " + e.message);
    }

}



function SelezArticolo_Step01_fillList() {
    try {

        var filter = $("#pageOrder_SelezArticolo_Step01_Panel_filter").val().toString().trim();

        var objResp = SEARCHJS.matchArray(_qtDS.dataSource.basi_soloBarcode, { "BaseCodice": filter, "Descrizione": filter, _join: "OR", _text: true });
        $("#pageOrder_SelezArticolo_Step01_Panel_list").listview()[0].innerHTML = "";

        listItemDiv = "<li data-role=\"list-divider\">Basi Trovate<span class=\"ui-li-count\">" + objResp.length.toString() + "</span></li>";
        $("#pageOrder_SelezArticolo_Step01_Panel_list").append(listItemDiv);


        if (objResp.length == 0) {
            var listItem = "<li disabled=\"disabled\" data-theme=\"c\">Nessuna base trovata.</li>";
            $("#pageOrder_SelezArticolo_Step01_Panel_list").append(listItem);
        }
        else if (objResp.length > 200) {
            var listItem = "<li disabled=\"disabled\" data-theme=\"c\">La ricerca ha restituito troppi risultati.</li>";
            $("#pageOrder_SelezArticolo_Step01_Panel_list").append(listItem);
        } else {
            //elenco risultati

            for (var index = 0; index < objResp.length; index++) {
                var base = objResp[index];


                var listItem = ""
                if (base.CntListiniTestata == 1) {
                    listItem = "<li data-theme=\"b\"><a href=\"#\" onclick=\"SelezArticolo_GoTo_Step02('" + base.BaseCodice + "');\" class=\"ui-alt-icon\"><h2>" + base.BaseCodice + " - " + base.Descrizione + "</h2></p></a></li>";
                } else {
                    listItem = "<li data-theme=\"b\"><a href=\"#\" onclick=\"SelezArticolo_GoTo_Step02('" + base.BaseCodice + "');\" class=\"ui-alt-icon\"><h2>" + base.BaseCodice + " - " + base.Descrizione + "</h2></p><span class=\"ui-li-count\">" + base.CntListiniTestata + " listini</span></a></li>";
                }



                $("#pageOrder_SelezArticolo_Step01_Panel_list").append(listItem);
            }
        }

        $("#pageOrder_SelezArticolo_Step01_Panel_list").listview("refresh");


    } catch (e) {
        alert("Errore SelezArticolo_Step01_fillList: " + e.message);
    }

}

function SelezArticolo_GoTo_Step02(base) {
    _artSelezGuidata = new ArticoloSelezioneGuidata();
    _artSelezGuidata.BaseCodice = base;

    PageChange('#pageOrder_SelezArticolo_Step02', false);

}



function SelezArticolo_Step02_fillList() {
    try {

        var filter = $("#pageOrder_SelezArticolo_Step02_Panel_filter").val().toString().trim();

        var objResp = SEARCHJS.matchArray(_qtDS.dataSource.ListiniTestata_SoloBarCode, { "BaseCodice": _artSelezGuidata.BaseCodice, "Descrizione": filter, _text: true });
        $("#pageOrder_SelezArticolo_Step02_Panel_list").listview()[0].innerHTML = "";

        listItemDiv = "<li data-role=\"list-divider\">Listini<span class=\"ui-li-count\">" + objResp.length.toString() + "</span></li>";
        $("#pageOrder_SelezArticolo_Step02_Panel_list").append(listItemDiv);


        if (objResp.length == 0) {
            var listItem = "<li disabled=\"disabled\" data-theme=\"c\">Nessun listino trovato.</li>";
            $("#pageOrder_SelezArticolo_Step02_Panel_list").append(listItem);
        }
        else if (objResp.length > 200) {
            var listItem = "<li disabled=\"disabled\" data-theme=\"c\">La ricerca ha restituito troppi risultati.</li>";
            $("#pageOrder_SelezArticolo_Step02_Panel_list").append(listItem);
        } else {
            //elenco risultati

            for (var index = 0; index < objResp.length; index++) {
                var listino = objResp[index];

                var listItem = "<li data-theme=\"b\">" +
                                    "<a href=\"#\" onclick=\"SelezArticolo_GoTo_Step03(" + listino.Gruppo + ");\" class=\"ui-alt-icon\"><h2>" + listino.Gruppo + " - " + listino.Descrizione + "</h2></p></a></li>";
                $("#pageOrder_SelezArticolo_Step02_Panel_list").append(listItem);
            }
        }

        $("#pageOrder_SelezArticolo_Step02_Panel_list").listview("refresh");


    } catch (e) {
        alert("Errore SelezArticolo_Step02_fillList: " + e.message);
    }
}


function SelezArticolo_GoTo_Step03(Gruppo) {
    _artSelezGuidata.Gruppo = Gruppo;
    PageChange('#pageOrder_SelezArticolo_Step03', false);

}


function SelezArticolo_Step03_fillList() {
    try {

        var filter = $("#pageOrder_SelezArticolo_Step03_Panel_filter").val().toString().trim();

        var objResp_liv1 = SEARCHJS.matchArray(_qtDS.dataSource.listiniCorpo, { "Ordine": 999, "BaseCodice": _artSelezGuidata.BaseCodice, "Gruppo": _artSelezGuidata.Gruppo });
        var objResp = SEARCHJS.matchArray(objResp_liv1, { _join: "OR", "ArticoloCodice": filter, "Descrizione": filter, _text: true });

        //var objResp = SEARCHJS.matchArray(_qtDS.dataSource.listiniCorpo, { "Ordine": 999, "BaseCodice": _artSelezGuidata.BaseCodice, "Gruppo": _artSelezGuidata.Gruppo });//, { _join: "OR", "ArticoloCodice": filter, "Descrizione": filter, _text: true });

        $("#pageOrder_SelezArticolo_Step03_Panel_list").listview()[0].innerHTML = "";

        listItemDiv = "<li data-role=\"list-divider\">Articoli<span class=\"ui-li-count\">" + objResp.length.toString() + "</span></li>";
        $("#pageOrder_SelezArticolo_Step03_Panel_list").append(listItemDiv);

        if (objResp.length == 0) {

            var listItem = "<li disabled=\"disabled\" data-theme=\"c\">Nessun articolo trovato.</li>";
            $("#pageOrder_SelezArticolo_Step03_Panel_list").append(listItem);
        }
        else if (objResp.length > 200) {

            var listItem = "<li disabled=\"disabled\" data-theme=\"c\">La ricerca ha restituito troppi risultati.</li>";
            $("#pageOrder_SelezArticolo_Step03_Panel_list").append(listItem);
        } else {
            //elenco risultati

            for (var index = 0; index < objResp.length; index++) {


                var articolo = objResp[index];

                var listItem = "<li data-theme=\"b\">" +
                                    "<a href=\"#\" onclick=\"SelezArticolo_Confirm(" + articolo.Progressivo + ",'" + articolo.ArticoloCodice + "');\" class=\"ui-alt-icon\"><h2>" + articolo.ArticoloCodice + " - " + articolo.Descrizione + "</h2></p></a></li>";
                $("#pageOrder_SelezArticolo_Step03_Panel_list").append(listItem);
            }
        }

        $("#pageOrder_SelezArticolo_Step03_Panel_list").listview("refresh");

    } catch (e) {
        alert("Errore SelezArticolo_Step03_fillList: " + e.message);
    }
}



function SelezArticolo_Confirm(Progressivo, ArticoloCodice) {
    //alert("SelezArticolo_Confirm + " + Progressivo + "-" + ArticoloCodice);
    _artSelezGuidata.Progressivo = Progressivo;
    _artSelezGuidata.ArticoloCodice = ArticoloCodice;
    PageChange('#pageOrder', true);
    $("#pageOrderRowAdd").val(_artSelezGuidata.ArticoloCodice);
}




function OrderOpen(orderCode) {

    var richiestaConferma = false;

    var ordini = SEARCHJS.matchArray(_qtOrders.orders, { "orderCode": orderCode });
    var OrdineInLavoro = null;

    if (ordini.length > 0) {
        OrdineInLavoro = ordini[0];

        if (richiestaConferma == false) {
            _qtOrderWorking = OrdineInLavoro.orderCode;
            PageChange("#pageOrder");
            return;
        }

    } else {
        navigator.notification.alert("Ordine non trovato", null, "QuickTrade", "OK");
        return;
    }



    var strShow = "";
    var strTitle = "";

    if (OrdineInLavoro.orderStatus == ORDER_STATUS.NEW) {
        strShow = "Recuperare l'ordine incompleto?";
        strTitle = "Recupero Ordine";
    } else if (OrdineInLavoro.orderStatus == ORDER_STATUS.COMPLETED) {
        strShow = "Modificare l'ordine nonostante sia pronto per essere inviato al server di Quick Trade?";
        strTitle = "Modifica Ordine";
    } else if (OrdineInLavoro.orderStatus == ORDER_STATUS.TRASFERITO) {
        strShow = "Visualizzare l'ordine inviato al server di Quick Trade?";
        strTitle = "Visualizza Ordine";
    }

    navigator.notification.confirm(strShow,
                                    function (buttonIndex) {
                                        if (buttonIndex == 1) {

                                            _qtOrderWorking = OrdineInLavoro.orderCode;
                                            PageChange("#pageOrder");

                                        }
                                    },
                                    strTitle,
                                    "Si,No");
}


//DANIELE BARLOCCO - versione originale 
//function OrderOpen(orderCode, isEditFromSynchro) {
//    var strShow = "Recuperare l'ordine incompleto?";
//    var strTitle = "Recupero Ordine";
//    if (isEditFromSynchro) {
//        strShow = "Modificare l'ordine nonostante sia pronto per essere inviato al server di Quick Trade?";
//        strTitle = "Modifica Ordine";
//    }
//    navigator.notification.confirm(strShow,
//                                    function (buttonIndex) {
//                                        if (buttonIndex == 1) {
//                                            for (var index = 0; index < _qtOrders.orders.length; index++) {
//                                                if (_qtOrders.orders[index].orderCode == orderCode) {
//                                                    _qtOrderWorking = _qtOrders.orders[index].orderCode;
//                                                    PageChange("#pageOrder");
//                                                }
//                                            }
//                                        }
//                                    },
//                                    strTitle,
//                                    "Si,No");
//}


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
                        rows.push(new QTOrderRowUpload(_qtOrders.orders[index].rows[indexR].articleBarcode, _qtOrders.orders[index].rows[indexR].OggettoCodice, _qtOrders.orders[index].rows[indexR].Qta));
                    }

                    var destCodice = null;
                    var contatto = null;
                    var annotazioni = null;
                    var email = null;
                    if (_qtOrders.orders[index].customerDestData) {
                        destCodice = _qtOrders.orders[index].customerDestData.DestinazioneCodice;
                    }
                    if (_qtOrders.orders[index].orderContatto1) {
                        contatto = _qtOrders.orders[index].orderContatto1;
                        contatto = contatto.replace(/&/g, "");
                        contatto = contatto.replace(/=/g, "");
                        contatto = contatto.replace(/\?/g, "");
                        contatto = contatto.replace(/'/g, "");
                        contatto = contatto.replace(/"/g, "");
                    }
                    if (_qtOrders.orders[index].orderAnnotazioni) {
                        annotazioni = _qtOrders.orders[index].orderAnnotazioni;
                        annotazioni = annotazioni.replace(/&/g, "");
                        annotazioni = annotazioni.replace(/=/g, "");
                        annotazioni = annotazioni.replace(/\?/g, "");
                        annotazioni = annotazioni.replace(/'/g, "");
                        annotazioni = annotazioni.replace(/"/g, "");
                    }
                    if (_qtOrders.orders[index].orderEMail) {
                        email = _qtOrders.orders[index].orderEMail;
                        email = email.replace(/&/g, "");
                        email = email.replace(/=/g, "");
                        email = email.replace(/\?/g, "");
                        email = email.replace(/'/g, "");
                        email = email.replace(/"/g, "");
                    }


                    //alert(contatto);
                    //alert(annotazioni);

                    try {

                        _qtOrdersUpload.orders.push(new QTOrderUpload(_qtOrders.orders[index].orderCode,
                                                                      _qtOrders.orders[index].orderDate,
                                                                      _qtOrders.orders[index].customerCode,
                                                                      destCodice,
                                                                      rows,
                                                                      _qtOrders.orders[index].operatorCode,
                                                                      _qtOrders.orders[index].operatorPassword,
                                                                      index,
                                                                      contatto,
                                                                      annotazioni,
                                                                      email));
                    } catch (e) {
                        alert("ERRORE Preparo Ordini: " + e.message);
                    }

                }
            }
        }

        //alert(JSON.stringify(_qtOrdersUpload));

        //data: JSON.stringify({ "orders": JSON.stringify(_qtOrdersUpload) }),
        //Effettuo l'invio
        $.ajax({
            url: GetServerURL("orders/SaveOrder.ashx"), // orders
            type: "GET",
            dataType: "jsonp",
            data: JSON.stringify(_qtOrdersUpload),
            success: function (result) {
                if (result.success) {

                    //Rimuovo gli ordini che ho gi� caricato su server (in ordine inverso per evitare che si modifichino gli index).

                    //DANIELE BARLOCCO 12/5/2016 
                    //NON RIMUOVO PI� GLI ORDINI, MA LI IMPOSTO COME TRASFERITI
                    /*
                    for (var index = _qtOrdersUpload.orders.length - 1; index >= 0; index--) {
                        _qtOrders.orders.splice(_qtOrdersUpload.orders[index].orderIndex, 1);
                    }
                    */

                    for (var index = _qtOrdersUpload.orders.length - 1; index >= 0; index--) {
                        var idxOrdine = _qtOrdersUpload.orders[index].orderIndex;

                        var orderCode_PerCliente = null;

                        var ordiniEsito = SEARCHJS.matchArray(result.ordiniCodice_list, { "orderCode": _qtOrders.orders[idxOrdine].orderCode });
                        if (ordiniEsito.length > 0) { orderCode_PerCliente = ordiniEsito[0].orderCode_PerCliente; };


                        //alert("orderCode_PerCliente " + orderCode_PerCliente);
                        
                        _qtOrders.orders[idxOrdine].orderCode_PerCliente = orderCode_PerCliente;
                        _qtOrders.orders[idxOrdine].orderDateTransfer = GetDataAttuale();
                        _qtOrders.orders[idxOrdine].orderDateTransfer_PerUtente = GetDataAttuale_PerUtente();
                        _qtOrders.orders[idxOrdine].orderStatus = ORDER_STATUS.TRASFERITO;
                        


                    }


                    _qtOrdersUpload = null;
                    try {
                        //Salvo su file gli ordini gi� scaricati su server
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
                    FailCallback(result.errors.toString());
                    //navigator.notification.alert("Sincronizzazione ordini fallita.\nDettaglio: " + result.errors.toString(), function () {
                    //    return;
                    //}, "Sincronizzazione Fallita", "OK");

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



//ritorna data attuale in stringa con formato YYYYMMDD
function GetDataAttuale() {
    var dt = new Date();
    var yyyy = dt.getFullYear().toString();
    var mm = (dt.getMonth() + 1).toString();
    var dd = dt.getDate().toString();
    return yyyy + (mm[1] ? mm : "0" + mm[0]) + (dd[1] ? dd : "0" + dd[0]);
}


//ritorna data attuale in stringa con formato DD/MM/YYYY
function GetDataAttuale_PerUtente() {

    var dt = new Date();
    var yyyy = dt.getFullYear().toString();
    var mm = (dt.getMonth() + 1).toString();
    var dd = dt.getDate().toString();

    var hh = dt.getHours().toString();
    var nn = dt.getMinutes().toString();
    var ss = dt.getSeconds().toString();
    //return (dd[1] ? dd : "0" + dd[0]) + "/" + (mm[1] ? mm : "0" + mm[0]) + "/" + yyyy + ' ' + (hh[1] ? hh : "0" + hh[0]) + ":" + (nn[1] ? nn : "0" + nn[0]) + ":" + (ss[1] ? ss : "0" + ss[0]);
    return (dd[1] ? dd : "0" + dd[0]) + "/" + (mm[1] ? mm : "0" + mm[0]) + "/" + yyyy + ' ' + (hh[1] ? hh : "0" + hh[0]) + ":" + (nn[1] ? nn : "0" + nn[0]);
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

        if (isNaN($.trim($("#pageOptionsTxtServerPort").val()))) {
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
                //Al salvataggio della configurazione, se � il primo avvio reinizializzo tutto.
                //Inizializzo la configurazione
                QTConfigInitAndVerify();
                //Leggo anche datasource
                QTDataSourceInitAndVerify();
                //Leggo anche ordini memorizzati
                QTOrderListInitAndVerify();
            }

            _firstStart = false;
            $("#pageMainContent").css("display", "");
            $("#pageMainHeaderNavBar").css("display", "");

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

                                                        }, function (errorDetail) {
                                                            //fallito
                                                            var str = "";
                                                            if (errorDetail) {
                                                                str = "Impossibile sincronizzare uno o pi\u00f9 ordini.\n\nDettaglio: " + errorDetail.toString();
                                                            } else {
                                                                str = "Impossibile sincronizzare uno o pi\u00f9 ordini.";
                                                            }
                                                            navigator.notification.alert(str, function () {
                                                                PageChange("#pageMain", true);
                                                                return;
                                                            }, "Ordine non sincronizzato", "OK");
                                                            return;



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
                        //LoaderHide(); << Gi� richiamato
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


//ELENCO ORDINI CHIUSI, MA NON TRASFERITI
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

            if (uploadOrders > 1)
                $("#pageSymcInfo").html("Sono presenti " + uploadOrders.toString() + " ordini da scaricare sul server di Quick Trade.");
            else
                $("#pageSymcInfo").html("E' presente 1 ordine da scaricare sul server di Quick Trade.");


            $("#pageSyncOrdList").listview()[0].innerHTML = "";

            var listItemDiv = "<li data-role=\"list-divider\">Ordini da trasferire<span class=\"ui-li-count\">" + uploadOrders.toString() + "</span></li>";
            $("#pageSyncOrdList").append(listItemDiv);

            for (var index = 0; index < _qtOrders.orders.length; index++) {
                if (_qtOrders.orders[index].orderStatus == ORDER_STATUS.COMPLETED) {
                    var order = _qtOrders.orders[index];
                    var numRows = 0;
                    if (order.rows)
                        numRows = order.rows.length;

                    var listItem = "<li data-theme=\"b\" data-icon=\"edit\">" +
                                        "<a href=\"#\" onclick=\"OrderOpen('" + order.orderCode + "');\" class=\"ui-alt-icon\"><h2>" + order.customerDescr + "</h2>" +
                                        "<span class=\"ui-li-count\">" + numRows + ((numRows == 1) ? " Riga" : " Righe") + "</span>" +
                                        "<p>Del " + order.orderCode.substring(6, 8) + "/" + order.orderCode.substring(4, 6) + "/" + order.orderCode.substring(0, 4) + " alle " +
                                        order.orderCode.substring(8, 10) + ":" + order.orderCode.substring(10, 12) + "</p></a></li>";


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
    OrdersCheckList();


});

$(document).on("pagebeforeshow", "#pageOrder", function () {

    $("#pageOrderRowAdd").val("");
    pageOrder_SelezionatoTipoArticolo("TP");
    OrderTableRefresh();
    OrderCustomerApplyStyle();


});

$(document).on("pagebeforeshow", "#pageOrder_SelezArticolo_Step01", function () {
    $("#pageOrder_SelezArticolo_Step01_Panel_filter").val("");
    SelezArticolo_Step01_fillList();
});

$(document).on("pageinit", "#pageOrder_SelezArticolo_Step01", function () {
    $("#pageOrder_SelezArticolo_Step01_Panel_filter").keyup(function (event) {
        SelezArticolo_Step01_fillList();
    });
});


$(document).on("pagebeforeshow", "#pageOrder_SelezArticolo_Step02", function () {
    $("#pageOrder_SelezArticolo_Step02_Panel_filter").val("");
    SelezArticolo_Step02_fillList();
});

$(document).on("pageinit", "#pageOrder_SelezArticolo_Step02", function () {
    $("#pageOrder_SelezArticolo_Step02_Panel_filter").keyup(function (event) {
        SelezArticolo_Step02_fillList();
    });
});


$(document).on("pagebeforeshow", "#pageOrder_SelezArticolo_Step03", function () {
    $("#pageOrder_SelezArticolo_Step03_Panel_filter").val("");
    SelezArticolo_Step03_fillList();
});


$(document).on("pageinit", "#pageOrder_SelezArticolo_Step03", function () {
    $("#pageOrder_SelezArticolo_Step03_Panel_filter").keyup(function (event) {
        SelezArticolo_Step03_fillList();
    });
});




var goodPrefix = /^(\+|-)?((\d*(\.?\d*)?)|(\.\d*))$/

$('#pageOrderRowQta')
    .data("oldValue", '')
    .bind('input propertychange', function () {
        var $this = $(this);
        var newValue = $this.val();
        if (!goodPrefix.test(newValue))
            return $this.val($this.data('oldValue'));
        return $this.data('oldValue', newValue)
    });




function pageOrder_SelezionatoTipoArticolo(tipo) {

    /*
        $(this).closest('ul').find('a').removeClass('ui-btn-active');
    $(this).addClass('ui-btn-active');
    */
    $("#pageOrder_TipoArticolo_TP").removeClass('ui-btn-active');
    $("#pageOrder_TipoArticolo_TG").removeClass('ui-btn-active');
    $("#pageOrder_TipoArticolo_TGG").removeClass('ui-btn-active');

    if (tipo == 'TP') {
        $("#pageOrderRowQta").val(1);
        $("#pageOrderRowQta").attr("disabled", "disabled");
        $("#pageOrder_TipoArticolo_TP").addClass('ui-btn-active');
    }
    if (tipo == 'TG') {
        $("#pageOrder_TipoArticolo_TG").addClass('ui-btn-active');
        $("#pageOrderRowQta").removeAttr('disabled');
    }
    if (tipo == 'TGG') {
        $("#pageOrder_TipoArticolo_TGG").addClass('ui-btn-active');
        $("#pageOrderRowQta").removeAttr('disabled');
    }

    _pageOrder_TipoArticoloSelezionato = tipo;

    //alert(_pageOrder_TipoArticoloSelezionato);
}



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

    if (!_qtProfile.OperatorePassword) {
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
    order.operatorCode = _qtProfile.OperatoreCodice;
    order.operatorPassword = _qtProfile.OperatorePassword;

    _qtOrderWorking = order.orderCode;
    _qtOrders.orders.push(order);
    PageChange("#pageOrder");






    if (FUNZIONAMENTO_OFFLINE == false) {
        ServerOnlineVerify(function () {
            //ONLINE, niente da notificare
        }, function (textStatus, textError) {
            //OFFLINE-ERRORE
            navigator.notification.alert("Il server Quick Trade non \u00e8 raggiungibile, non sar\u00e0 possibile completare correttamente l'ordine.", function () {
                return;
            }, "Attenzione", "OK");
        });
    }


}




//function pageOrderCancel() {

//    navigator.notification.confirm("Annullare l'inserimento dell'ordine?",
//                                    function (buttonIndex) {
//                                        if (buttonIndex == 1) {

//                                            try {

//                                                if (_qtOrders.getOrder(_qtOrderWorking)) {
//                                                    if ((!_qtOrders.getOrder(_qtOrderWorking).customerCode) && (_qtOrders.getOrder(_qtOrderWorking).rows.length == 0)) {
//                                                        //non ho scelto n� cliente ne ho righe quindi non propongo di tenere nulla
//                                                        pageOrderCancelExecute(true);
//                                                    } else {
//                                                        navigator.notification.confirm("Mantenere l'ordine attuale?",
//                                                                                        function (buttonIndex) {
//                                                                                            var removeOrder = false;
//                                                                                            if (buttonIndex != 1) {
//                                                                                                removeOrder = true;
//                                                                                            }
//                                                                                            pageOrderCancelExecute(removeOrder);
//                                                                                        },
//                                                                                        "Attenzione",
//                                                                                        "Si,No");
//                                                    }
//                                                } else {
//                                                    //ordine non valido
//                                                    pageOrderCancelExecute(true);
//                                                }

//                                            } catch (e) {
//                                                alert("ERRORE pageOrderCancel: " + e.message);
//                                            }


//                                        }
//                                    },
//                                    "Attenzione",
//                                    "Si,No");




//}

//function pageOrderCancelExecute(removeOrder) {
//    try {

//        if (removeOrder) {
//            //rimuovo l'ordine attuale perch� non va mantenuto
//            var indexDelete = -1;
//            for (var index = 0; index < _qtOrders.orders.length; index++) {
//                if (_qtOrders.orders[index].orderCode == _qtOrderWorking)
//                    indexDelete = index;
//            }
//            if (indexDelete >= 0) {
//                _qtOrders.orders.splice(indexDelete, 1);
//                //_qtOrders.orders.pop();
//            }
//        } else {
//            //Alessandro Gioachini
//            //non rimuovo l'ordine, va mantenuto. Per� imposto come stato in lavorazione anche se si � tentato un invio. Cos� l'utente pu� non solo reinviarlo, ma anche modificarlo nuovamente.
//            //Daniele Barlocco 12/5/2016
//            //Re-imposto l'ordine a NUOVO solo se non � stato effettivamente trasferito
//            if (!_qtOrders.getOrder(_qtOrderWorking).orderStatus == ORDER_STATUS.COMPLETED) {
//                _qtOrders.getOrder(_qtOrderWorking).orderStatus = ORDER_STATUS.NEW;
//            }

//        }

//        _qtOrderWorking = null;

//        try {
//            //Salvo su file l'ordine che sto compilando (non si sa mai!) Success, Fail
//            _qtOrders.saveToFile(function () {
//                //salvataggio temporaneo dell'ordine riuscito.
//            }, function (err) {
//                navigator.notification.alert("Errore durante il salvataggio temporaneo dell'ordine.\nDettaglio: " + FileGetErrorMessage(err), function () {
//                    return;

//                }, "Attenzione", "OK");
//                return;
//            });
//        } catch (e) {
//            alert("Errore JS save ordine: " + e.message);
//        }

//        PageChange('#pageMain', true);

//    } catch (e) {
//        alert("ERRORE pageOrderCancelExecute: " + e.message);
//    }
//}




function pageOrderExit() {

    if (pageOrderCloseIfEmpty() == true) {
        return;
    }



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
        alert("Errore pageOrderExit: " + e.message);
    }


    var ordini = SEARCHJS.matchArray(_qtOrders.orders, { "orderCode": _qtOrderWorking });
    var OrdineInLavoro = null;
    if (ordini.length > 0) { OrdineInLavoro = ordini[0]; }

    _qtOrderWorking = null;

    if (!OrdineInLavoro) {
        //alert("non trovato");
        PageChange('#pageMain', true);
        return;
    }

    if (OrdineInLavoro.orderStatus == ORDER_STATUS.TRASFERITO) {
        //alert("trasferito");
        PageChange('#pageOrdiniTrasferiti', true);
    } else {
        //alert("normale");
        PageChange('#pageMain', true);
    }

}




function pageOrderCloseIfEmpty() {

    var ordineEliminato = false

    if (!_qtOrderWorking) {
        ordineEliminato = true
    }

    if (_qtOrders.getOrder(_qtOrderWorking)) {
        if ((!_qtOrders.getOrder(_qtOrderWorking).customerCode) && (_qtOrders.getOrder(_qtOrderWorking).rows.length == 0)) {

            //non ho scelto n� cliente ne ho righe quindi non propongo di tenere nulla
            pageOrderDeleteExecute();
            ordineEliminato = true
        }
    }
    else {

        //ordine non valido
        pageOrderDeleteExecute();
        ordineEliminato = true
    }




    return ordineEliminato;

}

function pageOrderDelete() {

    if (pageOrderCloseIfEmpty() == true) {
        return;
    }

    navigator.notification.confirm("Eliminare l' ordine?",
                                    function (buttonIndex) {
                                        if (buttonIndex == 1) {

                                            try {


                                                navigator.notification.confirm("Attenzione!\n L'operazione non \u00e8 reversibile, confermi l'eliminazione?",
                                                                                function (buttonIndex) {
                                                                                    if (buttonIndex == 1) {
                                                                                        pageOrderDeleteExecute();
                                                                                    }
                                                                                },
                                                                                "Attenzione",
                                                                                "Si,No");


                                            } catch (e) {
                                                alert("ERRORE pageOrderCancel: " + e.message);
                                            }


                                        }
                                    },
                                    "Attenzione",
                                    "Si,No");




}

function pageOrderDeleteExecute() {
    try {


        //rimuovo l'ordine attuale perch� non va mantenuto
        var indexDelete = -1;
        for (var index = 0; index < _qtOrders.orders.length; index++) {
            if (_qtOrders.orders[index].orderCode == _qtOrderWorking)
                indexDelete = index;
        }
        if (indexDelete >= 0) {
            _qtOrders.orders.splice(indexDelete, 1);
            //_qtOrders.orders.pop();
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
        alert("ERRORE pageOrderDeleteExecute: " + e.message);
    }
}



function OrderDeleteAll_PageMain() {
    OrderDeleteByStatus(ORDER_STATUS.NEW, OrdersCheckList);
}


function OrderDeleteAll_PageTrasferiti() {
    OrderDeleteByStatus(ORDER_STATUS.TRASFERITO, OrdersCheckList_trasferiti, [false]);
}




function OrderDeleteByStatus(status, callback, args) {
    try {
        var ordiniDaEliminare = SEARCHJS.matchArray(_qtOrders.orders, { "orderStatus": status });
        if (ordiniDaEliminare.length == 0) {
            return;
        }
        var confermato = false;

        //richiesta di conferma all'utente
        var conferma1 = "Eliminare tutti gli ordini selezionati?";
        var conferma2 = "Verrano eliminati definitivamente " + ordiniDaEliminare.length + " ordini.\nL'operazione non \u00e8 reversibile, procedere con l'eliminazione?";

        if (status == ORDER_STATUS.NEW) {
            conferma1 = "Eliminare tutti gli ordini in lavoro?";
        } else if (status == ORDER_STATUS.COMPLETED) {
            conferma1 = "Eliminare tutti gli ordini chiusi, ma non trasferiti?";
        }
        else if (status == ORDER_STATUS.TRASFERITO) {
            conferma1 = "Eliminare tutti gli ordini trasferiti?";
        }

        $("#pageMainHeaderNavBar_DeleteAll").removeClass('ui-btn-active');

        navigator.notification.confirm(conferma1,
                                        function (buttonIndex) {
                                            if (buttonIndex == 1) {
                                                try {
                                                    navigator.notification.confirm(conferma2,
                                                                                    function (buttonIndex) {
                                                                                        if (buttonIndex == 1) {

                                                                                            OrderDeleteByStatus_core(status);

                                                                                            callback.apply(this, args);



                                                                                        }
                                                                                    }, "Attenzione", "Si,No");
                                                } catch (e) {
                                                    alert("ERRORE OrderDeleteByStatus: " + e.message);
                                                }
                                            }
                                        }, "Attenzione", "Si,No");


    } catch (e) {
        alert("ERRORE OrderDeleteByStatus: " + e.message);
    }
}





function OrderDeleteByStatus_core(status) {
    try {


        //ELIMINAZIONE EFFETTIVA
        _qtOrderWorking = null;
        for (var index = _qtOrders.orders.length - 1; index >= 0; index--) {
            var o = _qtOrders.orders[index];
            if (o.orderStatus == status) {
                _qtOrders.orders.splice(index, 1);
            }
        }


        //salvataggio su file        
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



    } catch (e) {
        alert("ERRORE OrderDeleteByStatus_core: " + e.message);
    }
}




function OrderTableRefresh() {


    //table-articles
    try {
        var rows = _qtOrders.getOrder(_qtOrderWorking).rows;
        var html = "";

        //A.Gioachini 05/02/2016 - vado a mostrare se � una campionatura 2T o Cervo
        var tipoOrdine = "";
        if (_qtOrders.getOrder(_qtOrderWorking).rows.length > 0) {
            var firstRow = _qtOrders.getOrder(_qtOrderWorking).rows[0];
            var firstRowFirstChar = firstRow.baseObj.BaseCodice.substring(0, 1);

            if ((firstRowFirstChar == "2") || (firstRowFirstChar == "3")) {
                tipoOrdine = " (2T)";
            } else {
                tipoOrdine = " (Cervotessile)";
            }
            firstRowFirstChar = null;
            firstRow = null;
        }

        if (rows.length == 1)
            $("#pageOrderRowNum").html("1 Riga" + tipoOrdine);
        else
            $("#pageOrderRowNum").html(rows.length.toString() + " Righe" + tipoOrdine);

        //for (var i = 0; i < rows.length; i++) {
        for (var i = rows.length - 1; i >= 0; i--) {
            var descrEtichetta = "";
            if (rows[i].listinoCorpoObj.Descrizione) {
                descrEtichetta = rows[i].listinoCorpoObj.Descrizione;
            }


            if (_qtOrders.getOrder(_qtOrderWorking).orderStatus == ORDER_STATUS.COMPLETED || _qtOrders.getOrder(_qtOrderWorking).orderStatus == ORDER_STATUS.TRASFERITO) {



                //SOLA LETTURA
                html = html + "<tr>" +
                    "<td style=\"vertical-align: middle;\">" + rows[i].listinoCorpoObj.ArticoloCodice + "</td>" +
                    "<td style=\"vertical-align: middle;\">" + rows[i].baseObj.Descrizione + "</td>" +
                    "<td style=\"vertical-align: middle;\">" + descrEtichetta + "</td>" +
                    "<td style=\"vertical-align: middle;\">" + rows[i].OggettoCodice + "</td>" +
                    "<td style=\"vertical-align: middle;\">" + rows[i].Qta + "</td>" +
                    "<td style=\"vertical-align: middle; align: center;\">--</td>" +
                  "</tr>";
            } else {

                //RIGA EDITABILE
                html = html + "<tr>" +
                                "<td style=\"vertical-align: middle;\"><a href=\"#\" onclick=\"ListiniShowBarcode('" + rows[i].listinoCorpoObj.ArticoloCodice + "');\">" + rows[i].listinoCorpoObj.ArticoloCodice + "</a></td>" +
                                "<td style=\"vertical-align: middle;\">" + rows[i].baseObj.Descrizione + "</td>" +
                                "<td style=\"vertical-align: middle;\">" + descrEtichetta + "</td>" +
                                "<td style=\"vertical-align: middle;\">" + rows[i].OggettoCodice + "</td>" +
                                "<td style=\"vertical-align: middle;\">" + rows[i].Qta + "</td>" +
                                "<td style=\"vertical-align: middle; align: center;\">" +
                                    "<a href=\"#\" class=\"ui-shadow ui-btn ui-corner-all ui-btn-icon-notext ui-icon-delete ui-btn-a\" onclick=\"OrderRemoveArticle(" + i.toString() + ");\">Rimuovi</a>" +
                                "</td>" +
                              "</tr>";
            }
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

function OrderAddArticle_ORIGINALE() {
    try {

        var code = $.trim($("#pageOrderRowAdd").val());


        //controllo che ci sia un barcode
        if (code.length == 0) {
            navigator.notification.beep(1);
            navigator.notification.vibrate(2000);
            //navigator.notification.alert("Il campo [Codice] non \u00e8 stato compilato.", function () {
            //    return;
            //}, "Attenzione", "OK");

            navigator.notification.alert("Il campo [Codice] non \u00e8 stato compilato.", function () {
                $("#pageOrderRowAdd").focus();
            }, "Attenzione", "OK");

            return;
        }

        //se il valore letto � di lunghezza inferiore al codice standard cervotessile (19 char) svuoto il campo 
        if (code.length < 19) {
            navigator.notification.beep(1);
            navigator.notification.vibrate(2000);
            navigator.notification.alert("Il campo [Codice] non ha un formato valido.", function () {
                $("#pageOrderRowAdd").val("");
                return;
            }, "Attenzione", "OK");
            return;

        }


        //alert("_qtOrderWorking: " + _qtOrderWorking);

        //lo ricerco
        var matches = SEARCHJS.matchArray(_qtDS.dataSource.listiniCorpo, { "ArticoloCodice": code, "Ordine": 999 });

        //verifico esito ricerca
        switch (matches.length) {
            case 0:
                //match not found
                navigator.notification.beep(1);
                navigator.notification.vibrate(2000);
                navigator.notification.alert("Codice non trovato.", function () {
                    $("#pageOrderRowAdd").val("");
                    return;
                }, "Attenzione", "OK");
                break;

            case 1:
                //match found

                var alreadyExists = null;

                //Verifico che non sia gi� stato letto il codice (solo se sto inserendo un "TP"
                if (_pageOrder_TipoArticoloSelezionato == 'TP') {
                    var alreadyExists = SEARCHJS.matchArray(_qtOrders.getOrder(_qtOrderWorking).rows, { "articleBarcode": code, "OggettoCodice": "TP" });

                    if (alreadyExists.length > 0) {
                        navigator.notification.beep(1);
                        navigator.notification.vibrate(2000);
                        navigator.notification.alert(ConvertToUTF8("Il codice \u00e8 gi\u00e0 stato letto, non verr\u00e0 inserito nuovamente."), function () {
                            alreadyExists = null;
                            $("#pageOrderRowAdd").val("");
                            return;
                        }, "Attenzione", "OK");
                        return;
                    }
                }


                alreadyExists = null;

                //Cerco la base
                var matchBase = SEARCHJS.matchArray(_qtDS.dataSource.basi, { "BaseCodice": matches[0].BaseCodice });
                if (matchBase.length == 0) {
                    navigator.notification.beep(1);
                    navigator.notification.vibrate(2000);
                    navigator.notification.alert(ConvertToUTF8("Corrispondenza con la Base non trovata. Il codice letto non verr\u00e0 inserito."), function () {
                        alreadyExists = null;
                        $("#pageOrderRowAdd").val("");
                        return;
                    }, "Attenzione", "OK");
                    return;
                }

                //A.Gioachini 05/02/2016 - controllo che non mischino le letture 2T e Cervo
                if (_qtOrders.getOrder(_qtOrderWorking).rows.length > 0) {
                    //ho gi� letto il primo articolo, verifico se la campionatura � di Cervotessile o 2T
                    var firstRow = _qtOrders.getOrder(_qtOrderWorking).rows[0];
                    var firstRowFirstChar = firstRow.baseObj.BaseCodice.substring(0, 1);
                    var firstCharArtLetto = matches[0].BaseCodice.substring(0, 1);

                    var bolOrder2T = false;
                    if ((firstRowFirstChar == "2") || (firstRowFirstChar == "3")) {
                        bolOrder2T = true;
                    }

                    if (bolOrder2T && (firstCharArtLetto != "2") && (firstCharArtLetto != "3")) {
                        //ordine 2T ma articolo letto Cervo
                        navigator.notification.beep(1);
                        navigator.notification.vibrate(2000);
                        navigator.notification.alert(ConvertToUTF8("E' stato letto un articolo Cervotessile ma \u00e8 in corso una campionatura Secondo Tempo. Il codice letto non verr\u00e0 inserito."), function () {
                            alreadyExists = null;
                            match = null;
                            matchBase = null;
                            $("#pageOrderRowAdd").val("");
                            return;
                        }, "Attenzione", "OK");
                        return;

                    } else {
                        if ((!bolOrder2T) && (firstCharArtLetto == "2" || firstCharArtLetto == "3")) {
                            //ordine Cervo ma articolo letto 2T
                            navigator.notification.beep(1);
                            navigator.notification.vibrate(2000);
                            navigator.notification.alert(ConvertToUTF8("E' stato letto un articolo Secondo Tempo ma \u00e8 in corso una campionatura Cervotessile. Il codice letto non verr\u00e0 inserito."), function () {
                                alreadyExists = null;
                                match = null;
                                matchBase = null;
                                $("#pageOrderRowAdd").val("");
                                return;
                            }, "Attenzione", "OK");
                            return;

                        }
                    }
                }


                $("#popup_pageOrderRowQta").popup("open");
                               

                var qta = $('#pageOrderRowQta').val()//.toFixedDown(2);
                if (!qta) { qta = 1; }
                qta = TroncaDecimali(qta, 2);



                _qtOrders.getOrder(_qtOrderWorking).rows.push(new QTOrderRow(code, matchBase[0], matches[0], _pageOrder_TipoArticoloSelezionato, qta));
                OrderTableRefresh();

                try {
                    //Salvo su file l'ordine che sto compilando (non si sa mai!) Success, Fail
                    _qtOrders.saveToFile(function () {
                        //salvataggio temporaneo dell'ordine riuscito.
                        $("#pageOrderRowAdd").val("");
                        matches = null;

                    }, function (err) {
                        navigator.notification.beep(1);
                        navigator.notification.vibrate(2000);
                        navigator.notification.alert("Errore durante il salvataggio temporaneo dell'ordine.\nDettaglio: " + FileGetErrorMessage(err), function () {
                            $("#pageOrderRowAdd").val("");
                            matches = null;
                            return;

                        }, "Attenzione", "OK");
                        return;
                    });

                } catch (e) {
                    alert("Errore JS save ordine: " + e.message);
                }

                break;

            default:
                //pi� risultati
                navigator.notification.beep(1);
                navigator.notification.vibrate(2000);
                navigator.notification.alert("Il Codice \u00e8 stato trovato, ma risultano " + matches.length.toString() + " corrispondenze.", function () {
                    return;
                }, "Attenzione", "OK");
                break;
        }







    } catch (e) {
        alert("Errore OrderAddArticle: " + e.message);
    }
}


















function OrderAddArticle_Check() {

    try {
        var code = $.trim($("#pageOrderRowAdd").val());
        //controllo che ci sia un barcode
        if (code.length == 0) {
            navigator.notification.beep(1);
            navigator.notification.vibrate(2000);
            //navigator.notification.alert("Il campo [Codice] non \u00e8 stato compilato.", function () {
            //    return;
            //}, "Attenzione", "OK");

            navigator.notification.alert("Il campo [Codice] non \u00e8 stato compilato.", function () {
                $("#pageOrderRowAdd").focus();
            }, "Attenzione", "OK");

            return false;
        }

        //se il valore letto � di lunghezza inferiore al codice standard cervotessile (19 char) svuoto il campo 
        if (code.length < 19) {
            navigator.notification.beep(1);
            navigator.notification.vibrate(2000);
            navigator.notification.alert("Il campo [Codice] non ha un formato valido.", function () {
                $("#pageOrderRowAdd").val("");
                return;
            }, "Attenzione", "OK");
            return false;

        }


        var matches = SEARCHJS.matchArray(_qtDS.dataSource.listiniCorpo, { "ArticoloCodice": code, "Ordine": 999 });

        //verifico esito ricerca
        if (matches.length == 0) {
            //match not found
            navigator.notification.beep(1);
            navigator.notification.vibrate(2000);
            navigator.notification.alert("Codice non trovato.", function () {
                $("#pageOrderRowAdd").val("");
                return false;
            }, "Attenzione", "OK");
            return false;
        }

        if (matches.length > 1) {
            //pi� risultati
            navigator.notification.beep(1);
            navigator.notification.vibrate(2000);
            navigator.notification.alert("Il Codice \u00e8 stato trovato, ma risultano " + matches.length.toString() + " corrispondenze.", function () {
                $("#pageOrderRowAdd").val("");
                return false;
            }, "Attenzione", "OK");
            return false;
        }

        if (matches.length == 1) {

            var alreadyExists = null;

            //Verifico che non sia gi� stato letto il codice (solo se sto inserendo un "TP"
            if (_pageOrder_TipoArticoloSelezionato == 'TP') {
                var alreadyExists = SEARCHJS.matchArray(_qtOrders.getOrder(_qtOrderWorking).rows, { "articleBarcode": code, "OggettoCodice": "TP" });

                if (alreadyExists.length > 0) {
                    navigator.notification.beep(1);
                    navigator.notification.vibrate(2000);
                    navigator.notification.alert(ConvertToUTF8("Il codice \u00e8 gi\u00e0 stato letto, non verr\u00e0 inserito nuovamente."), function () {
                        alreadyExists = null;
                        $("#pageOrderRowAdd").val("");
                        return false;
                    }, "Attenzione", "OK");
                    return false;
                }
            }


            alreadyExists = null;

            //Cerco la base
            var matchBase = SEARCHJS.matchArray(_qtDS.dataSource.basi, { "BaseCodice": matches[0].BaseCodice });
            if (matchBase.length == 0) {
                navigator.notification.beep(1);
                navigator.notification.vibrate(2000);
                navigator.notification.alert(ConvertToUTF8("Corrispondenza con la Base non trovata. Il codice letto non verr\u00e0 inserito."), function () {
                    alreadyExists = null;
                    $("#pageOrderRowAdd").val("");
                    return;
                }, "Attenzione", "OK");
                return false;
            }

            //A.Gioachini 05/02/2016 - controllo che non mischino le letture 2T e Cervo
            if (_qtOrders.getOrder(_qtOrderWorking).rows.length > 0) {
                //ho gi� letto il primo articolo, verifico se la campionatura � di Cervotessile o 2T
                var firstRow = _qtOrders.getOrder(_qtOrderWorking).rows[0];
                var firstRowFirstChar = firstRow.baseObj.BaseCodice.substring(0, 1);
                var firstCharArtLetto = matches[0].BaseCodice.substring(0, 1);

                var bolOrder2T = false;
                if ((firstRowFirstChar == "2") || (firstRowFirstChar == "3")) {
                    bolOrder2T = true;
                }

                if (bolOrder2T && (firstCharArtLetto != "2") && (firstCharArtLetto != "3")) {
                    //ordine 2T ma articolo letto Cervo
                    navigator.notification.beep(1);
                    navigator.notification.vibrate(2000);
                    navigator.notification.alert(ConvertToUTF8("E' stato letto un articolo Cervotessile ma \u00e8 in corso una campionatura Secondo Tempo. Il codice letto non verr\u00e0 inserito."), function () {
                        alreadyExists = null;
                        match = null;
                        matchBase = null;
                        $("#pageOrderRowAdd").val("");
                        return;
                    }, "Attenzione", "OK");
                    return false;

                } else {
                    if ((!bolOrder2T) && (firstCharArtLetto == "2" || firstCharArtLetto == "3")) {
                        //ordine Cervo ma articolo letto 2T
                        navigator.notification.beep(1);
                        navigator.notification.vibrate(2000);
                        navigator.notification.alert(ConvertToUTF8("E' stato letto un articolo Secondo Tempo ma \u00e8 in corso una campionatura Cervotessile. Il codice letto non verr\u00e0 inserito."), function () {
                            alreadyExists = null;
                            match = null;
                            matchBase = null;
                            $("#pageOrderRowAdd").val("");
                            return;
                        }, "Attenzione", "OK");
                        return false;

                    }
                }
            }

            return true;
        }

    } catch (e) {
        alert("Errore OrderAddArticle_Check: " + e.message);
    }


}

//----------------------------------------------------------------------------------------------------------------------

function OrderAddArticle() {
    try {
        if (OrderAddArticle_Check() == false) { return; }

        if (_pageOrder_TipoArticoloSelezionato == 'TP') {
            OrderAddArticle_core(1)
        }
        else {
            $('#pageOrderRowQta').val(1);
            $("#popup_pageOrderRowQta").popup("open");
        }

    } catch (e) {
        alert("Errore OrderAddArticle: " + e.message);
    }
}



$("#popup_pageOrderRowQta").bind({
    popupafterclose: function (event, ui) {
        var qta = $('#pageOrderRowQta').val();
        OrderAddArticle_core(qta);
    }
});


function OrderAddArticle_core(qta) {

    try {

        var code = $.trim($("#pageOrderRowAdd").val());


        if (!qta) { qta = 1; }
        qta = TroncaDecimali(qta, 2);

        var matches = SEARCHJS.matchArray(_qtDS.dataSource.listiniCorpo, { "ArticoloCodice": code, "Ordine": 999 });
        var matchBase = SEARCHJS.matchArray(_qtDS.dataSource.basi, { "BaseCodice": matches[0].BaseCodice });

        _qtOrders.getOrder(_qtOrderWorking).rows.push(new QTOrderRow(code, matchBase[0], matches[0], _pageOrder_TipoArticoloSelezionato, qta));
        OrderTableRefresh();

        //Salvo su file l'ordine che sto compilando (non si sa mai!) Success, Fail
        _qtOrders.saveToFile(function () {
            //salvataggio temporaneo dell'ordine riuscito.
            $("#pageOrderRowAdd").val("");
            matches = null;

        }, function (err) {
            navigator.notification.beep(1);
            navigator.notification.vibrate(2000);
            navigator.notification.alert("Errore durante il salvataggio temporaneo dell'ordine.\nDettaglio: " + FileGetErrorMessage(err), function () {
                $("#pageOrderRowAdd").val("");
                matches = null;
                return;

            }, "Attenzione", "OK");
            return;
        });

    } catch (e) {
        alert("Errore JS OrderAddArticle_core: " + e.message);
    }

}







function OrderSave() {

    if (!_qtOrderWorking) { return; }
    if (!_qtOrders.getOrder(_qtOrderWorking)) { return; }

    if (_qtOrders.getOrder(_qtOrderWorking).orderStatus == ORDER_STATUS.TRASFERITO) {
        navigator.notification.alert("L'ordine corrente \u00e8 gi\u00e0 stato trasferito.", function () { return; }, "Attenzione", "OK");
    }



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

function OrderReopen() {


    if (!_qtOrderWorking) { return; }
    if (!_qtOrders.getOrder(_qtOrderWorking)) { return; }


    if (_qtOrders.getOrder(_qtOrderWorking).orderStatus == ORDER_STATUS.TRASFERITO) {
        navigator.notification.alert("L'ordine corrente \u00e8 gi\u00e0 trasferito.", function () { return; }, "Non consentito.", "OK");
    }

    if (_qtOrders.getOrder(_qtOrderWorking).orderStatus == ORDER_STATUS.NEW) {
        navigator.notification.alert("L'ordine corrente \u00e8 gi\u00e0 in fase di modifica.", function () { return; }, "Attenzione", "OK");
    }




    navigator.notification.confirm("Riaprire l'ordine per la modifica?",
                                function (buttonIndex) {
                                    if (buttonIndex == 1) {
                                        //salvo

                                        _qtOrders.getOrder(_qtOrderWorking).orderStatus = ORDER_STATUS.NEW;

                                        _qtOrders.saveToFile(function () { },
                                                            function (err) {
                                                                navigator.notification.alert("Errore durante il salvataggio temporaneo dell'ordine.\nDettaglio: " + FileGetErrorMessage(err),
                                                                function () { return; }, "Attenzione", "OK");
                                                                return;
                                                            });

                                        $("#pageOrderRowAdd").val("");
                                        pageOrder_SelezionatoTipoArticolo("TP");
                                        OrderCustomerApplyStyle();
                                        OrderTableRefresh();


                                        //$("#pageOrder_Panel_listView").panel("close");

                                        //PageChange("#pageOrder", true);    ///non funziona da qua
                                    }
                                },
                                "Richiesta di conferma",
                                "Si,No");




}



function OrderSave_All() {
    $("#pageMainHeaderNavBar_SaveAll").removeClass('ui-btn-active');

    navigator.notification.confirm("Confermare l'invio di tutti gli ordini in lavoro validi?\nVerranno inviati solamente gli ordini completi.",
                                    function (buttonIndex) {
                                        if (buttonIndex == 1) {
                                            navigator.notification.confirm("Attenzione!\n L'operazione non \u00e8 reversibile, procedere?",
                                            function (buttonIndex) {
                                                if (buttonIndex == 1) {
                                                    OrderSave_All_core();
                                                }
                                            },
                                    "Attenzione", "Si,No");
                                        }
                                    }, "Salvataggio Ordine", "Si,No");


}


function OrderSave_All_core() {



    _qtOrderWorking = null;
    if (!_qtOrders) { return; }
    if (!_qtOrders.orders) { return; }
    if (_qtOrders.orders.length == 0) { return; }


    for (var i = 0; i < _qtOrders.orders.length; i++) {
        if (_qtOrders.orders[i].orderStatus == ORDER_STATUS.NEW) {
            var o = _qtOrders.orders[i];
            if (o.customerCode && o.rows) {
                if (o.rows.length > 0) {
                    o.orderStatus = ORDER_STATUS.COMPLETED;
                }
            }
        }
    }


    OrdersCheckList();


    //trasferisco tutti gli ordini in stato COMPLETED
    OrderSaveExecute_core(false);


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
        // alert("_qtOrders.getOrder(_qtOrderWorking).orderStatus " + _qtOrders.getOrder(_qtOrderWorking).orderStatus);
        _qtOrders.getOrder(_qtOrderWorking).orderStatus = ORDER_STATUS.COMPLETED;
        //alert("_qtOrders.getOrder(_qtOrderWorking).orderStatus " + _qtOrders.getOrder(_qtOrderWorking).orderStatus);
        try {
            //Salvo su file l'ordine che sto compilando (non si sa mai!) Success, Fail
            _qtOrders.saveToFile(function () {
                OrderSaveExecute_core(true);
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


function OrderSaveExecute_core(uploadOnlyWorkingOrder) {
    ServerOnlineVerify(function () {
        //server online
        OrderUploadAll(function () {
            //success
            navigator.notification.alert("Operazione eseguita correttamente.", function () {
                if (uploadOnlyWorkingOrder == true) { PageChange("#pageMain", true); } else { OrdersCheckList(); }
                return;
            }, "Operazione eseguita", "OK");
            return;

        }, function (errorDetail) {
            //fail
            var str = "";
            if (errorDetail) {
                str = "Errore durante il tentativo di salvare un ordine: " + errorDetail.toString();
            } else {
                str = "Errore durante il tentativo di salvare un ordine.";
            }
            navigator.notification.alert(str, function () {
                if (uploadOnlyWorkingOrder == true) { PageChange("#pageMain", true); } else { OrdersCheckList(); }
                return;
            }, "Ordine non sincronizzato", "OK");
            return;

        }, uploadOnlyWorkingOrder);

    }, function () {
        //server offline
        navigator.notification.alert("Il server di Quick Trade non risulta disponibile. L'ordine \u00e8 stato salvato e dovr\u00e0 essere caricato manualmente in un secondo momento.", function () {
            if (uploadOnlyWorkingOrder == true) { PageChange("#pageMain", true); } else { OrdersCheckList(); }
            return;
        }, "Attenzione", "OK");
        return;
    });

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




    } catch (e) {
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
        if (_qtOrders.getOrder(_qtOrderWorking).customerCode && _qtOrders.getOrder(_qtOrderWorking).orderStatus != ORDER_STATUS.TRASFERITO) {
            CustomerSelect(_qtOrders.getOrder(_qtOrderWorking).customerCode);
        }
    });

});

$(document).on("pageaftershow", "#pageCustomer", function () {
    $("#pageCustomerInfoCli").listview("refresh");
    $("#pageCustomerInfoDest").listview("refresh");
});


$(document).on("pagebeforeshow", "#pageCustomer", function () {

    //alert("pageCustomer - beforeshow");

    //pageCustomerContatto1
    //pageCustomerAnnotazioni

    if (_qtOrders.getOrder(_qtOrderWorking).orderStatus == ORDER_STATUS.COMPLETED || _qtOrders.getOrder(_qtOrderWorking).orderStatus == ORDER_STATUS.TRASFERITO) {
        //schermata in sola lettura
        CustomerChangeView(null, 0);
        $("#pageCustomerContatto1").attr("disabled", "disabled");
        $("#pageCustomerAnnotazioni").attr('disabled', 'disabled');
        $("#pageCustomerEMail").attr('disabled', 'disabled');

    }
    else {

        $("#pageCustomerContatto1").removeAttr('disabled');
        $("#pageCustomerAnnotazioni").removeAttr('disabled');
        $("#pageCustomerEMail").removeAttr('disabled');

        if (_qtOrders.getOrder(_qtOrderWorking).customerCode) {
            CustomerChangeView(null, 0);
        } else {
            CustomerChangeView(null, 1);
        }
    }




    CustomerInfoFill();

    $("#pageCustomerFilter").val("");
    $("#pageCustomerList").listview()[0].innerHTML = "";



    if (_qtOrders.getOrder(_qtOrderWorking).customerCode) {
        $("#pageCustomerNavbar").show();
        $("#pageCustomerContatto1").val(_qtOrders.getOrder(_qtOrderWorking).orderContatto1);
        $("#pageCustomerAnnotazioni").val(_qtOrders.getOrder(_qtOrderWorking).orderAnnotazioni);
        $("#pageCustomerEMail").val(_qtOrders.getOrder(_qtOrderWorking).orderEMail);
    } else {
        $("#pageCustomerNavbar").hide();
    }

});

/*------------------------------------------------  CONTATTO 1 --------------------------------------------------*/
$("#pageCustomerContatto1").change(function () {
    if (_qtOrderWorking) {
        _qtOrders.getOrder(_qtOrderWorking).orderContatto1 = $(this).val();

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
            alert("Errore JS pageCustomerContatto1 change save ordine: " + e.message);
        }
    }
});

$('#pageCustomerContatto1').keypress(function (e) {
    var keyCode = event.keyCode || event.which
    // Don't validate the input if below arrow, delete and backspace keys were pressed 
    if (keyCode == 8) { // || (keyCode >= 35 && keyCode <= 40)) { // Left / Up / Right / Down Arrow, Backspace, Delete keys
        return;
    }
    var key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
    if (CONTATTO_NOTE_ALLOWED_CHARS.toUpperCase().indexOf(key.toUpperCase()) == -1) {
        event.preventDefault();
        return false;
    }
});

/*------------------------------------------------  ANNOTAZIONI --------------------------------------------------*/
$("#pageCustomerAnnotazioni").change(function () {
    if (_qtOrderWorking) {
        _qtOrders.getOrder(_qtOrderWorking).orderAnnotazioni = $(this).val();

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
            alert("Errore JS pageCustomerAnnotazioni change save ordine: " + e.message);
        }
    }
});

$('#pageCustomerAnnotazioni').keypress(function (e) {
    var keyCode = event.keyCode || event.which
    // Don't validate the input if below arrow, delete and backspace keys were pressed 
    if (keyCode == 8 || (keyCode >= 35 && keyCode <= 40)) { // Left / Up / Right / Down Arrow, Backspace, Delete keys
        return;
    }
    var key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
    if (CONTATTO_NOTE_ALLOWED_CHARS.toUpperCase().indexOf(key.toUpperCase()) == -1) {
        event.preventDefault();
        return false;
    }
});



/*------------------------------------------------  EMAIL --------------------------------------------------*/
$("#pageCustomerEMail").change(function () {
    if (_qtOrderWorking) {
        _qtOrders.getOrder(_qtOrderWorking).orderEMail = $(this).val();

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
            alert("Errore JS pageCustomerEMail change save ordine: " + e.message);
        }
    }
});

$('#pageCustomerEMail').keypress(function (e) {
    var keyCode = event.keyCode || event.which
    // Don't validate the input if below arrow, delete and backspace keys were pressed 
    if (keyCode == 8 || (keyCode >= 35 && keyCode <= 40)) { // Left / Up / Right / Down Arrow, Backspace, Delete keys
        return;
    }
    var key = String.fromCharCode(!event.charCode ? event.which : event.charCode);
    if (CONTATTO_NOTE_ALLOWED_CHARS.toUpperCase().indexOf(key.toUpperCase()) == -1) {
        event.preventDefault();
        return false;
    }
});









////////////////////////////////




















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
        var tipoDest = "Non specificato.";

        if (_qtOrders.getOrder(_qtOrderWorking).customerDestData) {
            if (_qtOrders.getOrder(_qtOrderWorking).customerDestData.RagioneSociale) {
                destRagSoc = _qtOrders.getOrder(_qtOrderWorking).customerDestData.RagioneSociale;
            }
            if (_qtOrders.getOrder(_qtOrderWorking).customerDestData.TipoDestinazione) {
                tipoDest = _qtOrders.getOrder(_qtOrderWorking).customerDestData.TipoDestinazione;
            }
        }

        strInfo = "";
        strInfo += "<h2>" + destRagSoc + "</h2><p>";
        strInfo += CustomerDestinationGetInfo(_qtOrders.getOrder(_qtOrderWorking).customerDestData);
        strInfo += "<br/>Tipo Destinazione: <b>" + tipoDest + "</b></p>";

        $("#pageCustomerInfoDest").html(strInfo);
    }
}




function CustomerChangeView(sender, areaShowIndex) {
    try {
        //se sender � disabilitato non faccio il click
        if (sender) {
            if ($(sender).hasClass("ui-disabled")) {
                return;
            }
        }


        if (_qtOrders.getOrder(_qtOrderWorking).orderStatus == ORDER_STATUS.COMPLETED || _qtOrders.getOrder(_qtOrderWorking).orderStatus == ORDER_STATUS.TRASFERITO) {
            if (areaShowIndex == 1) {
                return;
            }
        }

        $("#pageCustomerViewInfo").removeClass('ui-btn-active');
        $("#pageCustomerViewRicerca").removeClass('ui-btn-active');


        switch (areaShowIndex) {
            case 0:
                $("#pageCustomerViewInfo").addClass('ui-btn-active');
                $("#pageCustomerRicerca").hide();
                $("#pageCustomerInfo").show();
                break;
            case 1:
                $("#pageCustomerViewRicerca").addClass('ui-btn-active');
                $("#pageCustomerInfo").hide();
                $("#pageCustomerRicerca").show();
                break;
        }

    } catch (e) {
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



    if (FUNZIONAMENTO_OFFLINE == true) {
        CustomersFilter_OffLine(filterStringValue);
        return;
    }


    //Se la stringa contiene spazi evito di fare richieste
    if ($.trim(filterStringValue).length == 0) {
        return;
    }

    //A.Gioachini 05/02/2016 - Se leggo un cliente da suo barcode stampato in accettazione non faccio la richiesta web finch� non ho il barcode intero (7 caratteri, compreso il $)
    if (($.trim(filterStringValue).substring(0, 1) == "$") && ($.trim(filterStringValue).length < 7)) {
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




function CustomersFilter_OffLine(filterStringValue) {

    try {

        //Se la stringa contiene spazi evito di fare richieste
        if ($.trim(filterStringValue).length == 0) {
            return;
        }

        //A.Gioachini 05/02/2016 - Se leggo un cliente da suo barcode stampato in accettazione non faccio la richiesta web finch� non ho il barcode intero (7 caratteri, compreso il $)
        if (($.trim(filterStringValue).substring(0, 1) == "$") && ($.trim(filterStringValue).length < 7)) {
            return;
        }



        var objResp = SEARCHJS.matchArray(_qtDS.dataSource.Anagrafica, { "RagioneSociale": filterStringValue, "AnagraficaCodice": filterStringValue, _join: "OR", _text: true });


        //alert("TROVATI: " + objResp.length.toString());

        $("#pageCustomerList").listview()[0].innerHTML = "";

        var listItemDiv = "";
        if (filterStringValue == $("#pageCustomerFilter").val()) {
            listItemDiv = "<li data-role=\"list-divider\">Risultati<span class=\"ui-li-count\">" + objResp.length.toString() + "</span></li>";
        } else {
            listItemDiv = "<li data-role=\"list-divider\">Cliente Selezionato<span class=\"ui-li-count\">" + objResp.length.toString() + "</span></li>";
        }
        $("#pageCustomerList").append(listItemDiv);

        _CustomerList = null;

        if (objResp.length == 0) {
            var listItem = "<li disabled=\"disabled\" data-theme=\"c\">Nessun cliente trovato.</li>";
            $("#pageCustomerList").append(listItem);
        } else if (objResp.length > 200) {
            var listItem = "<li disabled=\"disabled\" data-theme=\"c\">La ricerca ha restituito troppi risultati.</li>";
            $("#pageCustomerList").append(listItem);
        }
        else {
            //elenco risultati
            _CustomerList = objResp;
            for (var index = 0; index < objResp.length; index++) {
                var customer = objResp[index];
                var listItem = "<li data-theme=\"b\"><a href=\"#\" onclick=\"CustomerSelect('" + customer.AnagraficaCodice + "');\" class=\"ui-alt-icon\"><h2>" + customer.RagioneSociale + "</h2><p>";
                listItem += CustomerDestinationGetInfo(customer);
                listItem += "</p></a></li>";
                $("#pageCustomerList").append(listItem);
            }
        }











        $("#pageCustomerList").listview("refresh");
    }
    catch (e) {
        alert("Errore in CustomersFilter_OffLine: " + e.message);
    }




}



function CustomerDestinationGetInfo(customerObj) {
    if (!customerObj) {
        return "";
    }


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
            alert("NESSUNA DESTINAZIONE");
            CustomerSelectWithDestination(code, null);
        } else {
            CustomerShowDestinations(code);
        }

    } catch (e) {
        alert("Errore CustomerSelect: " + e.message);
    }

}

function CustomerShowDestinations(customerCode) {

    if (FUNZIONAMENTO_OFFLINE == true) {
        CustomerShowDestinations_OffLine(customerCode);
        return;
    }



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



function CustomerShowDestinations_OffLine(customerCode) {


    try {

        var objResp = SEARCHJS.matchArray(_qtDS.dataSource.customersdestinations, { "AnagraficaCodice": customerCode, _text: true });

        $("#pageCustomerDestList").listview()[0].innerHTML = "";

        var listItemDiv = "<li data-role=\"list-divider\">Selezione Destinazione Cliente</li>";
        $("#pageCustomerDestList").append(listItemDiv);

        //elenco risultati
        _CustomerDestinationList = objResp;
        for (var index = 0; index < objResp.length; index++) {
            var destination = objResp[index];
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
    RemoveClassIfExists($("#pageOrderCliente_div_TableAddArticolo"), "ui-screen-hidden");
    $("#pageOrderCliente").css("background-color", "");

    if (_qtOrders.getOrder(_qtOrderWorking)) {

        if (_qtOrders.getOrder(_qtOrderWorking).customerCode) {
            $("#pageOrderCliente").buttonMarkup({ theme: 'd' });

            var msgInfoTrasferimento = "Trasferimento non eseguito";
            if (_qtOrders.getOrder(_qtOrderWorking).orderDateTransfer_PerUtente) { msgInfoTrasferimento = "Data di trasferimento: " + _qtOrders.getOrder(_qtOrderWorking).orderDateTransfer_PerUtente }

            if (_qtOrders.getOrder(_qtOrderWorking).orderCode_PerCliente) { msgInfoTrasferimento = msgInfoTrasferimento +  " - Ordine di riferimento per il cliente: " + _qtOrders.getOrder(_qtOrderWorking).orderCode_PerCliente ;   }



            if ( (_qtOrders.getOrder(_qtOrderWorking).orderStatus == ORDER_STATUS.TRASFERITO) || (_qtOrders.getOrder(_qtOrderWorking).orderStatus == ORDER_STATUS.COMPLETED) ) {
                $("#pageOrderCliente").text(_qtOrders.getOrder(_qtOrderWorking).customerDescr + "\n\nListino " + _qtOrders.getOrder(_qtOrderWorking).customerData.ListinoCodice.toString() + "\n\n" + msgInfoTrasferimento);
                AddClassIfMissing($("#pageOrderCliente_div_TableAddArticolo"), "ui-screen-hidden");
                $("#pageOrderCliente").css("background-color", "grey");
            } else {
                $("#pageOrderCliente").text(_qtOrders.getOrder(_qtOrderWorking).customerDescr + "\n\nListino " + _qtOrders.getOrder(_qtOrderWorking).customerData.ListinoCodice.toString());
            }

            //GESTIONE VISUALIZZAZIONE PULSANTI PANNELLO DI CONTROLLO DELL'ORDINE
            $('#pageOrder_Panel_listView_Riapri').show();
            $('#pageOrder_Panel_listView_Trasferisci').show();
            if (_qtOrders.getOrder(_qtOrderWorking).orderStatus == ORDER_STATUS.NEW) {
                $('#pageOrder_Panel_listView_Riapri').hide();
            }
            if (_qtOrders.getOrder(_qtOrderWorking).orderStatus == ORDER_STATUS.COMPLETED) {

            }
            if (_qtOrders.getOrder(_qtOrderWorking).orderStatus == ORDER_STATUS.TRASFERITO) {
                $('#pageOrder_Panel_listView_Riapri').hide();
                $('#pageOrder_Panel_listView_Trasferisci').hide();
            }

            $("#pageOrderCliente").html($("#pageOrderCliente").html().replace(/\n/g, "<br/>"));

        } else {
            $("#pageOrderCliente").buttonMarkup({ theme: 'c' });
            $("#pageOrderCliente").text("Clicca qui per scegliere il Cliente");
        }
    }
}




function StatLoadHitScelte(LineaToLoad) {
    try {

        ServerOnlineVerify(function () {
            //ONLINE, niente da notificare
        }, function (textStatus, textError) {
            //OFFLINE-ERRORE
            navigator.notification.alert("Il server Quick Trade non \u00e8 raggiungibile, non \u00e8 possibile consultare le statistiche.", function () {
                return;
            }, "Attenzione", "OK");
        });

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
    $("#pageProfileTxtQtPassword").val(_qtProfile.OperatorePassword);
    $("#pageProfileTxtQtUUID").val(device.uuid);

});

$("#pageProfileTxtQtUser").change(function () {
    _ProfileInfo = null;
});

$("#pageProfileVerify").click(function () {
    ProfileOperatorsVerify($("#pageProfileTxtQtUser").val(), $("#pageProfileTxtQtPassword").val());
});

$("#pageProfileSave").click(function () {
    ProfileSave();
});

function ProfileOperatorsVerify(OperatorCode, OperatorPsw) {

    try {

        $.ajax({
            url: GetServerURL("operators"),
            method: "GET",
            dataType: "jsonp",
            data: { filter: OperatorCode },
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
                        _ProfileInfo.OperatorePassword = OperatorPsw;
                        navigator.notification.alert("Verifica dell'operatore completata con successo!\n\nDescrizione: " + objResp.operatorDesc, function () {
                            return;
                        }, "Attenzione", "OK");
                        return;

                    } else {
                        _ProfileInfo = null;
                        navigator.notification.alert("Nessun operatore trovato con codice: " + OperatorCode.toString(), function () {
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
        _qtProfile.OperatorePassword = _ProfileInfo.OperatorePassword;

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



    if (FUNZIONAMENTO_OFFLINE == true) {
        ListiniGetList_OffLine();
        return;
    }


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



function ListiniGetList_OffLine() {

    try {

        $("#pageListiniListino").find("option").remove().end();

        var objResp = _qtDS.dataSource.ElencoListinoCodice

        var selIndex = 0;
        for (var i = 0; i < objResp.length; i++) {
            $("#pageListiniListino").append($("<option>", {
                text: "Listino: " + objResp[i].ListinoCodice,
                value: objResp[i].ListinoCodice
            }));
            if (_ListinoViewed) {
                if (objResp[i].ListinoCodice == _ListinoViewed.listinoCodice) {
                    selIndex = i;
                }
            }
        }



        $('#pageListiniListino option')[selIndex].selected = true;
        $("#pageListiniListino").trigger("change");

    }



    catch (e) {
        LoaderHide();
        alert("Errore ListiniGetList_OffLine: " + e.message);
    }


}




function ListiniLoadBarcodeInfo() {


    //alert("barcode: " + _ListinoBarcodeToShow);
    //alert("listino: " + _ListinoShowListinoCodice);
    /*
    if (FUNZIONAMENTO_OFFLINE == true) {
        ListiniLoadBarcodeInfo_OffLine();
        return;
    }
    */
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



function ListiniLoadBarcodeInfo_OffLine() {

    //alert("_ListinoShowListinoCodice: " + _ListinoShowListinoCodice);
    //alert("_ListinoBarcodeToShow: " + _ListinoBarcodeToShow);
    //url: GetServerURL("lists/barcode"),
    //data: { barcode: _ListinoBarcodeToShow, listino: _ListinoShowListinoCodice },

    try {

        var strBarcode = _ListinoBarcodeToShow;
        var strListino = _ListinoShowListinoCodice;
        var strBaseCodice = "";
        var strBaseDescrizione = "";
        var strProgressivo = "";
        var strProgressivoDescrizione = "";
        var strGruppo = "";
        var strGruppoDescrizione = "";

        if (strBarcode.length == 19) {
            var isTP = strBarcode.match("TP");
            var isTF = strBarcode.match("TF");
            var isTS = strBarcode.match("TS");
            if (isTP || isTF || isTS) {
                strBaseCodice = strBarcode.substr(2, 5);
            }
        }

        if (strBaseCodice == "") {
            alert("Il codice [" & strBarcode & "] non rappresenta un barcode valido.");
            return;
        }



        //CARICO PROGRESSIVO ARTICOLO E GRUPPO
        var myListiniCorpo = SEARCHJS.matchArray(_qtDS.dataSource.listiniCorpo, { "ArticoloCodice": strBarcode });
        if (myListiniCorpo.length > 0) {
            strProgressivo = myListiniCorpo[0].Progressivo;
            strGruppo = myListiniCorpo[0].Gruppo;
        }

        //CARICO DATI SULLA BASE
        var myBasi = SEARCHJS.matchArray(_qtDS.dataSource.basi, { "BaseCodice": strBaseCodice });
        if (myBasi.length > 0) {
            strBaseDescrizione = myBasi[0].Descrizione;
        }

        //CARICO DATI SUL GRUPPO
        var myListiniTestata = SEARCHJS.matchArray(_qtDS.dataSource.ListiniTestata_SoloBarCode, { "BaseCodice": strBaseCodice, "Gruppo": strGruppo });


        if (myListiniTestata.length > 0) {
            strGruppoDescrizione = myListiniTestata[0].Descrizione;
        }


        //CARICO DATI SULL'ARTICOLO 
        var myListiniCorpo02 = SEARCHJS.matchArray(_qtDS.dataSource.listiniCorpo, { "BaseCodice": strBaseCodice, "Progressivo": strProgressivo });
        if (myListiniCorpo02.length > 0) {
            strProgressivoDescrizione = myListiniCorpo02[0].Descrizione;
        }


        var myObjGruppi = new ObjGruppi_OffLineStructure();
        myObjGruppi.Load(_qtDS, strBaseCodice, strListino);

        _ListinoViewed.baseCodice = strBaseCodice;
        _ListinoViewed.baseDesc = strBaseDescrizione;
        _ListinoViewed.gruppo = strGruppo;
        _ListinoViewed.gruppoDesc = strGruppoDescrizione;
        _ListinoViewed.listinoProgressivo = strProgressivo;
        _ListinoViewed.listinoProgressivoDesc = strProgressivoDescrizione;
        _ListinoViewed.objGruppi = myObjGruppi;

        _ListinoBarcodeToShow = null;
        _ListinoShowListinoCodice = null;
        ListiniDrawDatas();


    } catch (e) {
        alert("ERRORE ListiniLoadBarcodeInfo_OffLine: " + e.message);
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
        //Mostro il bottone "Cambia Gruppo" solo quando ho pi� di un gruppo.        
        if (_ListinoViewed.gruppo) {
            if (_ListinoViewed.objGruppi) {
                if (_ListinoViewed.objGruppi.length > 1) {
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

    /*
    if (FUNZIONAMENTO_OFFLINE == true) {
        ListiniLoadListView_OffLine();
        return;
    }
    */

    try {
        ////se ho sia base che gruppo devo mostrare gli articoli del gruppo (gi� scaricati), evito di proseguire nella function
        //if (_ListinoViewed.baseCodice && _ListinoViewed.gruppo) {
        //    ListiniLoadArticoliGruppo();
        //    return;
        //}

        //risorsa da interrogare
        var httpReq = "";
        if (!_ListinoViewed.baseCodice) {
            httpReq = "lists/basi";
            //alert("dabar - BASI");
        } else { // if (!_ListinoViewed.gruppo) {
            httpReq = "lists/groups";
            //alert("dabar - GRUPPI");
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
                                var listItem = "<li data-theme=\"b\"><a href=\"#\" onclick=\"ListiniSelectBase('" + item.BaseCodice + "', '" + item.Descrizione.replace(/\'/g, '') + "');\" class=\"ui-alt-icon\"><h2>" + item.Descrizione + " - " + item.BaseCodice + "</h2></a></li>";
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

                            //se ho sia base che gruppo devo mostrare gli articoli del gruppo (gi� scaricati), evito di proseguire nella function
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



function ListiniLoadListView_OffLine() {


    alert("ListiniLoadListView OFFLINE");

    try {
        ////se ho sia base che gruppo devo mostrare gli articoli del gruppo (gi� scaricati), evito di proseguire nella function
        //if (_ListinoViewed.baseCodice && _ListinoViewed.gruppo) {
        //    ListiniLoadArticoliGruppo();
        //    return;
        //}



        //risorsa da interrogare
        //var httpReq = "";
        //if (!_ListinoViewed.baseCodice) {
        //    httpReq = "lists/basi";
        //    //alert("dabar - BASI");
        //} else { // if (!_ListinoViewed.gruppo) {
        //    httpReq = "lists/groups";
        //    //alert("dabar - GRUPPI");
        //}


        //filtro da passare 
        var filter = null;
        if (!_ListinoViewed.baseCodice) {
            //BASI
            //filter = { filter: $("#pageListiniSearchField").val().toString() };

            filter = $("#pageListiniSearchField").val().toString().trim()


            var objResp = SEARCHJS.matchArray(_qtDS.dataSource.basi, { "BaseCodice": filter, "Descrizione": filter, _join: "OR", _text: true });

            //if (objResp.length > 0)
            //{alert(objResp.length);}


        } else {
            //gruppi
            filter = { base: _ListinoViewed.baseCodice.toString(), listino: $("#pageListiniListino").val() };
        }


        if (!_ListinoViewed.baseCodice) {
            //############################################
            //## CARICO ELENCO BASI (filtrato da utente)
            //############################################


            $("#pageListiniListView").listview()[0].innerHTML = "";

            listItemDiv = "<li data-role=\"list-divider\">Basi Trovate<span class=\"ui-li-count\">" + objResp.length.toString() + "</span></li>";
            $("#pageListiniListView").append(listItemDiv);



            if (objResp.length == 0) {
                var listItem = "<li disabled=\"disabled\" data-theme=\"c\">Nessuna base trovata.</li>";
                $("#pageListiniListView").append(listItem);
            }
            else if (objResp.length > 200) {
                var listItem = "<li disabled=\"disabled\" data-theme=\"c\">La ricerca ha restituito troppi risultati.</li>";
                $("#pageListiniListView").append(listItem);
            } else {
                //elenco risultati
                _CustomerList = objResp;
                for (var index = 0; index < objResp.length; index++) {
                    var item = objResp[index];
                    var listItem = "<li data-theme=\"b\"><a href=\"#\" onclick=\"ListiniSelectBase('" + item.BaseCodice + "', '" + item.Descrizione.replace(/\'/g, '') + "');\" class=\"ui-alt-icon\"><h2>" + item.Descrizione + " - " + item.BaseCodice + "</h2></a></li>";
                    $("#pageListiniListView").append(listItem);
                }
            }




        } else {
            /*            
                        var bolRows = false;
                        if (objResp.result) {
                            if (objResp.length > 0) {
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
            
                            //se ho sia base che gruppo devo mostrare gli articoli del gruppo (gi� scaricati), evito di proseguire nella function
                            if (_ListinoViewed.baseCodice && _ListinoViewed.gruppo) {
                                ListiniLoadArticoliGruppo();
                                return;
                            }
            
                        }
                        */
        }

        $("#pageListiniListView").listview("refresh");

        $.mobile.silentScroll(0);

        $("#pageListiniContainer").css("display", "");

        LoaderHide();



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
            if ((_ListinoViewed.objGruppi[index].BaseCodice == _ListinoViewed.baseCodice) &&
                (_ListinoViewed.objGruppi[index].Gruppo == _ListinoViewed.gruppo)) {
                itemToUse = _ListinoViewed.objGruppi[index];
            }
        }

        var html = "";

        if (itemToUse) {

            $("#pageListiniPrezziTitle").html(_ListinoViewed.baseDesc + " - " + _ListinoViewed.baseCodice + " <img src=\"img/arr_right.png\"/> " + _ListinoViewed.gruppoDesc);

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


$("#pageListiniBase").click(function () {
    _ListinoViewed.baseCodice = null;
    _ListinoViewed.baseDesc = null;
    _ListinoViewed.gruppo = null;
    _ListinoViewed.gruppoDesc = null;
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


    PageChange('', true);
    return;

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
    } catch (e) {
        alert("ERRORE ListiniSelectGruppo: " + e.message);
    }
}

//function ListiniSelectArticolo(strProgressivo, strDescrizione) {
//    _ListinoViewed.listinoProgressivo = strProgressivo;
//    _ListinoViewed.listinoProgressivoDesc = strDescrizione;
//    ListiniDrawDatas();
//}


$(document).on("pageinit", "#pageListini", function () {

    //alert("pageListini.pageinit");

    $(".ui-input-clear").css("backgroundColor", "#000");

    $("#pageListiniSearchField").keyup(function (event) {
        ListiniLoadListView();
    });



});

$(document).on("pagebeforeshow", "#pageListini", function () {

    //alert("pageListini.pagebeforeshow");

    $("#pageListiniContainer").css("display", "none");

    ListiniGetList();
});




$(document).on("pagebeforeshow", "#pageOrdiniTrasferiti", function () {

    var ordiniTrasferti = SEARCHJS.matchArray(_qtOrders.orders, { "orderStatus": ORDER_STATUS.TRASFERITO });

    AddClassIfMissing($("#pageMainOrd_Trasferiti"), "ui-screen-hidden");
    AddClassIfMissing($("#pageMainOrd_Trasferiti_dinamico"), "ui-screen-hidden");

    if (ordiniTrasferti.length > NR_MASSIMO_ORDINI_VISUALIZZABILI) {

        RemoveClassIfExists($("#pageMainOrd_Trasferiti_dinamico"), "ui-screen-hidden");

        $("#pageMainOrdList_Trasferiti_Filter").keyup(function (event) {
            OrdersCheckList_trasferiti(true);
        });

        OrdersCheckList_trasferiti(true);
    }
    else {

        RemoveClassIfExists($("#pageMainOrd_Trasferiti"), "ui-screen-hidden");

        OrdersCheckList_trasferiti(false);
    }


});



function OrdiniTrasferiti_LoadListView() {
    alert("OrdiniTrasferiti_LoadListView");
}




function ListiniInitializeNewClass() {
    //if (!_ListinoViewed) {
    //inizializzo l'oggetto
    _ListinoViewed = new QTListinoViewed(null, null, null, null, null, null, null, null);
    //}
}

function ListiniShowPage() {
    if (FUNZIONAMENTO_OFFLINE == true) {

        ListiniInitializeNewClass();
        _ListinoBarcodeToShow = null;
        _ListinoShowListinoCodice = null;

        $("#pageListiniListinoDiv").css("display", "");
        $("#pageListiniSearchField").val("");

        PageChange('#pageListini');

        return;
    }


    //svuoto variabili
    ServerOnlineVerify(function () {
        //ONLINE, niente da notificare

        ListiniInitializeNewClass();
        _ListinoBarcodeToShow = null;
        _ListinoShowListinoCodice = null;

        $("#pageListiniListinoDiv").css("display", "");
        $("#pageListiniSearchField").val("");
        PageChange('#pageListini');


    }, function (textStatus, textError) {
        //OFFLINE-ERRORE
        navigator.notification.alert("Il server Quick Trade non \u00e8 raggiungibile, non \u00e8 possibile consultare il listino prezzi.", function () {
            return;
        }, "Attenzione", "OK");
    });

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
        //imposto il listino selezionato e forzo il ricalcolo dei prezzi (se � necessario)
        ListiniSetListino($("#pageListiniListino").val());
        ListiniDrawDatas();
    } catch (e) {
        alert("ERRORE pageListiniListino change: " + e.message);
    }
});



