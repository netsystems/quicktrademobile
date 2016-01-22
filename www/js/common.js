var ORDER_STATUS = { "NEW": 1, "COMPLETED": 2};

function QTConfiguration() {
    var __fileName = "QTConfig.txt";

    //public properties
    this.initialize = function (vServerIP, vServerPortNumber) { //, vOperatoreCodiceQT
        if(vServerIP)
            this.ServerIP = vServerIP;
        else
            this.ServerIP = "";

        if (vServerPortNumber)
            this.ServerPortNumber = vServerPortNumber;
        else
            this.ServerPortNumber = 0;

        //if(vOperatoreCodiceQT)
        //    this.OperatoreCodiceQT = vOperatoreCodiceQT;
        //else
        //    this.OperatoreCodiceQT = "";
    }

    this.deleteFile = function () {
        FileExists(__fileName, function (fileExists) {
            if (fileExists) {
                FileDelete(__fileName, function () {
                    alert("cancellato");
                }, function (e) {
                    alert("Errore cancellazione configurazione: " + e.toString());
                })
            } else {
                alert("file non esiste x cancellarlo");
            }
        }, function (_err) {
            alert("Errore verifica esistenza configurazione: " + _err.toString());
        })
    }

    this.loadFromFile = function (Success, ConfigNotFound, Fail) {
        FileExists(__fileName, function (fileExists) {
            if (fileExists) {
                FileRead(__fileName,
                         function (text) {
                             // leggo il contenuto del file e me lo carico
                             var _read = JSON.parse(text.toString());
                             Success(_read);
                         },
                         function (_err) {
                             if (_err.code) {
                                 if (_err.code == FileError.NOT_FOUND_ERR) {
                                     ConfigNotFound();
                                 } else {
                                     Fail(_err);
                                 }
                             } else {
                                 Fail(_err);
                             }
                         });
            } else {
                ConfigNotFound();
            }
        }, function (_err) {
            alert("Errore verifica esistenza configurazione: " + _err.toString());
        })

    }

    this.saveToFile = function (Success, Fail) {
        FileWrite(__fileName,
                  JSON.stringify(this),
                  Success,
                  Fail);
    }
}


function QTProfile() {
    var __fileName = "QTProfile.txt";

    //public properties
    this.initialize = function (vOperatoreCodice, vOperatoreDescrizione) { 
        if (vOperatoreCodice)
            this.OperatoreCodice = vOperatoreCodice;
        else
            this.OperatoreCodice = "";

        if (vOperatoreDescrizione)
            this.OperatoreDescrizione = vOperatoreDescrizione;
        else
            this.OperatoreDescrizione = "";
    }

    this.deleteFile = function () {
        FileExists(__fileName, function (fileExists) {
            if (fileExists) {
                FileDelete(__fileName, function () {
                    alert("cancellato");
                }, function (e) {
                    alert("Errore cancellazione profilo: " + e.toString());
                })
            } else {
                alert("file non esiste x cancellarlo");
            }
        }, function (_err) {
            alert("Errore verifica esistenza profilo: " + _err.toString());
        })
    }

    this.loadFromFile = function (Success, ConfigNotFound, Fail) {
        FileExists(__fileName, function (fileExists) {
            if (fileExists) {
                FileRead(__fileName,
                         function (text) {
                             // leggo il contenuto del file e me lo carico
                             var _read = JSON.parse(text.toString());
                             Success(_read);
                         },
                         function (_err) {
                             if (_err.code) {
                                 if (_err.code == FileError.NOT_FOUND_ERR) {
                                     ConfigNotFound();
                                 } else {
                                     Fail(_err);
                                 }
                             } else {
                                 Fail(_err);
                             }
                         });
            } else {
                ConfigNotFound();
            }
        }, function (_err) {
            alert("Errore verifica esistenza profilo: " + _err.toString());
        })

    }

    this.saveToFile = function (Success, Fail) {
        FileWrite(__fileName,
                  JSON.stringify(this),
                  Success,
                  Fail);
    }
}



function QTDataSource() {
    var __fileName = "QTDataSource.txt";

    //public properties
    this.dataSource = null;


    this.deleteFile = function () {
        FileExists(__fileName, function (fileExists) {
            if (fileExists) {
                FileDelete(__fileName, function () {
                    alert("cancellato");
                }, function (e) {
                    alert("Errore cancellazione configurazione: " + e.toString());
                })
            } else {
                alert("file non esiste x cancellarlo");
            }
        }, function (_err) {
            alert("Errore verifica esistenza configurazione: " + _err.toString());
        })
    }

    this.loadFromFile = function (Success, ConfigNotFound, Fail) {
        FileExists(__fileName, function (fileExists) {
            if (fileExists) {
                FileRead(__fileName,
                         function (text) {
                             // leggo il contenuto del file e me lo carico
                             var _read = JSON.parse(text.toString());
                             Success(_read);
                         },
                         function (_err) {
                             if (_err.code) {
                                 if (_err.code == FileError.NOT_FOUND_ERR) {
                                     ConfigNotFound();
                                 } else {
                                     Fail(_err);
                                 }
                             } else {
                                 Fail(_err);
                             }
                         });
            } else {
                ConfigNotFound();
            }
        }, function (_err) {
            alert("Errore verifica esistenza configurazione: " + _err.toString());
        })

    }

    this.saveToFile = function (Success, Fail, ShowProgress, ProgressText) {
        FileWrite(__fileName,
                  this.dataSource,
                  Success,
                  Fail,
                  ShowProgress,
                  ProgressText);
    }
}



function QTOrder() {
    //public properties
    this.orderCode = GetOrderCode();
    this.orderDate = GetOrderDate();
    this.orderStatus = ORDER_STATUS.NEW;
    this.customerCode = null;
    this.customerDescr = null;
    //this.customerInfo = null;
    this.customerData = null;
    this.customerDestData = null;
    this.operatorCode = null; // operatorCode; //operatorCode
    this.rows = [];

    function GetOrderCode() {
        var dt = new Date();
        var yyyy = dt.getFullYear().toString();
        var mm = (dt.getMonth() + 1).toString();
        var dd = dt.getDate().toString();
        var hh = dt.getHours().toString();
        var nn = dt.getMinutes().toString();
        var ss = dt.getSeconds().toString();
        return yyyy + (mm[1] ? mm : "0" + mm[0]) + (dd[1] ? dd : "0" + dd[0]) + (hh[1] ? hh : "0" + hh[0]) + (nn[1] ? nn : "0" + nn[0]) + (ss[1] ? ss : "0" + ss[0]);
    }

    function GetOrderDate() {
        var dt = new Date();
        var yyyy = dt.getFullYear().toString();
        var mm = (dt.getMonth() + 1).toString();
        var dd = dt.getDate().toString();
        return yyyy + (mm[1] ? mm : "0" + mm[0]) + (dd[1] ? dd : "0" + dd[0]);
    }
}

function QTOrderRow(ArticleBarcode, BaseObj, ListinoCorpoObj) {
    this.articleBarcode = ArticleBarcode;
    //this.articleObj = ArticleObj;
    this.baseObj = BaseObj;
    this.listinoCorpoObj = ListinoCorpoObj;
}


function QTOrderUpload(orderCode, orderDate, customerCode, customerDestCode, rows, operatorCode, orderIndex) {
    this.orderCode = orderCode;
    this.orderDate = orderDate;
    this.customerCode = customerCode;
    this.customerDestCode = customerDestCode;
    this.operatorCode = operatorCode;
    this.rows = rows;
    this.orderIndex = orderIndex; //tengo traccia dell'index nell'array di partenza degli ordini (per successiva rimozione)
}

function QTOrderRowUpload(articleBarcode) {
    this.articleBarcode = articleBarcode;
}

function QTOrderList() {
    var __fileName = "QTOrders.txt";

    //dichiaro array vuoto
    this.orders = []; 


    this.deleteFile = function () {
        FileExists(__fileName, function (fileExists) {
            if (fileExists) {
                FileDelete(__fileName, function () {
                    alert("cancellato");
                }, function (e) {
                    alert("Errore cancellazione configurazione: " + e.toString());
                })
            } else {
                alert("file non esiste x cancellarlo");
            }
        }, function (_err) {
            alert("Errore verifica esistenza configurazione: " + _err.toString());
        })
    }

    this.loadFromFile = function (Success, ConfigNotFound, Fail) {

        FileExists(__fileName, function (fileExists) {
            if (fileExists) {
                FileRead(__fileName,
                         function (text) {
                             // leggo il contenuto del file e me lo carico
                             var _read = JSON.parse(text.toString());
                             Success(_read);
                         },
                         function (_err) {
                             if (_err.code) {
                                 if (_err.code == FileError.NOT_FOUND_ERR) {
                                     ConfigNotFound();
                                 } else {
                                     Fail(_err);
                                 }
                             } else {
                                 Fail(_err);
                             }
                         });
            } else {
                ConfigNotFound();
            }
        }, function (_err) {
            alert("Errore verifica esistenza configurazione: " + _err.toString());
        })

    }

    this.saveToFile = function (Success, Fail) {
        FileWrite(__fileName,
                  JSON.stringify(this.orders),
                  Success,
                  Fail);
    }

    this.getOrder = function (orderCode) {
        for (var i = 0; i < this.orders.length; i++) {
            if (this.orders[i].orderCode == orderCode)
                return this.orders[i];
        }
        return null;
    }
}



function QTListinoViewed(listinoCodice, baseCodice, baseDesc, gruppo, gruppoDesc, listinoProgressivo, listinoProgressivoDesc, objGruppi) {
    this.listinoCodice = listinoCodice;
    this.baseCodice = baseCodice;
    this.baseDesc = baseDesc;
    this.gruppo = gruppo;
    this.gruppoDesc = gruppoDesc;
    this.listinoProgressivo = listinoProgressivo;
    this.listinoProgressivoDesc = listinoProgressivoDesc;
    this.objGruppi = objGruppi;
}


//La funzione gestisce i cambi di pagina dell'app
//      pageTarget:     pagina in cui spostarsi (es #pageMain)
//      isBack:         se TRUE vuol dire che l'animazione viena fatta al contrario per un "ritorno alla pagina..."
function PageChange(pageTarget, isBack) {
    if (isBack) {
        try {
            history.back();
        } catch (e) {
            $.mobile.pageContainer.pagecontainer("change", pageTarget, { transition: "slide", reverse: true });
        }
    } else {
        $.mobile.pageContainer.pagecontainer("change", pageTarget, { transition: "slide" });
    }
}


// La funzione rimuove una classe ad un oggetto se trovata.
//     JQobj:      oggetto del DOM
//     className:  nome della classe
function RemoveClassIfExists(JQobj, className) {
    if (JQobj.hasClass(className))
        JQobj.removeClass(className);
}


// La funzione aggiunge una classe ad un oggetto se risulta mancante.
//     JQobj:      oggetto del DOM
//     className:  nome della classe
function AddClassIfMissing(JQobj, className) {
    if (!JQobj.hasClass(className))
        JQobj.addClass(className);
}

// La funzione verifica la validità di una stringa rappresentante un Indirizzo IP.
//      ipAddress:  stringa dell'indirizzo ip (es. "192.168.100.1")
var IpAddressRegEx = /^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|$)){4}$/;
function IpAddressIsValid(ipAddress) {
    try {
        return IpAddressRegEx.test(ipAddress.toString());
    } catch (e) {
        return false;
    }
}

//La funzione mostra la schermata di caricamento.
//      ShowText:   stringa contenente il messaggio da mostrare
function LoaderShow(ShowText) {
    try {
        $.mobile.loading("show", {
            text: ShowText,
            textVisible: true,
            theme: "b",
            html: ""
        });
    } catch (e) {
        alert("Errore LoaderShow: " + e.message);
    }

}

//La funzione chiude la schermata di caricamento.
function LoaderHide() {
    $.mobile.loading("hide");
}

//La funzione effettua un replace per tutte le occorrenze (e non solo sulla prima).
function ReplaceAll(str, find, replace) {
    return str.replace(new RegExp(find, 'g'), replace);
}

//La funzione converte i caratteri speciali in testo UTF-8
function ConvertToUTF8(text) {
    var t = text;
    t = ReplaceAll(t, "è", "\u00e8");
    t = ReplaceAll(t, "à", "\u00e0");
    return t;
}

//La funzione permette di fare un IF inline in stile VB
function IIF(condition, trueVal, falseVal) {
    if (condition) {
        return trueVal;
    } else {
        return falseVal;
    }
}