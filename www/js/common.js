var ORDER_STATUS = { "NEW": 1, "COMPLETED": 2, "TRASFERITO": 3 };

var TIPO_UTILIZZO = { "SEDE_CENTRALE": 1, "FIERA": 2 };

var OPERAZIONI = { "DOWNLOAD_DATASOURCE": 1, "UPLOAD_ORDINE": 2 ,"RICHIESTA_PREZZI": 3};

function QTConfiguration() {
    var __fileName = "QTConfig.txt";

    //public properties
    this.initialize = function (vServerIP, vServerPortNumber, vServerIP_Fiera, vServerPortNumber_Fiera, vind_tipo_utilizzo) {
        if (vServerIP)
            this.ServerIP = vServerIP;
        else
            this.ServerIP = "";

        if (vServerPortNumber)
            this.ServerPortNumber = vServerPortNumber;
        else
            this.ServerPortNumber = 0;


        if (vServerIP_Fiera)
            this.ServerIP_Fiera = vServerIP_Fiera;
        else
            this.ServerIP_Fiera = "";

        if (vServerPortNumber_Fiera)
            this.ServerPortNumber_Fiera = vServerPortNumber_Fiera;
        else
            this.ServerPortNumber_Fiera = 0;

        if (vind_tipo_utilizzo)
            this.ind_tipo_utilizzo = vind_tipo_utilizzo;
        else
            this.ind_tipo_utilizzo = TIPO_UTILIZZO.SEDE_CENTRALE;




        //if(vOperatoreCodiceQT)
        //    this.OperatoreCodiceQT = vOperatoreCodiceQT;
        //else
        //    this.OperatoreCodiceQT = "";
    }

    this.deleteFile = function () {
        FileExists(__fileName, function (fileExists) {
            if (fileExists) {
                FileDelete(__fileName, function () {
                    //alert("cancellato");
                }, function (e) {
                    alert("Errore cancellazione configurazione: " + e.toString());
                })
            } else {
                //alert("file non esiste x cancellarlo");
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


    this.SerialNumber = device.uuid;

    //public properties
    this.initialize = function (vOperatoreCodice, vOperatoreDescrizione, vOperatorePassword, vOperatoreMail) {

        if (vOperatoreCodice)
            this.OperatoreCodice = vOperatoreCodice;
        else
            this.OperatoreCodice = "";


        if (vOperatoreDescrizione)
            this.OperatoreDescrizione = vOperatoreDescrizione;
        else
            this.OperatoreDescrizione = "";


        if (vOperatorePassword) {
            this.OperatorePassword = vOperatorePassword;
        }
        else {
            this.OperatorePassword = "";
        }


        if (vOperatoreMail) {
            this.OperatoreMail = vOperatoreMail;
        }
        else {
            this.vOperatoreMail = "";
        }



    }

    this.deleteFile = function () {
        FileExists(__fileName, function (fileExists) {
            if (fileExists) {
                FileDelete(__fileName, function () {
                    //    alert("cancellato");
                }, function (e) {
                    alert("Errore cancellazione profilo: " + e.toString());
                })
            } else {
                ///  alert("file non esiste x cancellarlo");
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
                    //  alert("cancellato");
                }, function (e) {
                    alert("Errore cancellazione configurazione: " + e.toString());
                })
            } else {
                // alert("file non esiste x cancellarlo");
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

    this.orderCode_PerCliente = null;           //codice ordine per cliente dopo il trasferimento sul server


    this.orderDate = GetDataAttuale();


    this.orderStatus = ORDER_STATUS.NEW;

    this.orderDateTransfer_PerUtente = null;
    this.orderDateTransfer = null;

    this.customerCode = null;
    this.customerDescr = null;
    //this.customerInfo = null;
    this.customerData = null;
    this.customerDestData = null;

    this.operatorCode = null;
    this.operatorPassword = null;

    this.rows = [];
    this.orderContatto1 = null;
    this.orderAnnotazioni = null;
    this.orderAnnotazioni_interna = null;

    this.orderEMail = null;
    this.orderEMail_interna = null;
    this.MailErrorDescription = null;       //eventuale errore sulla mail sul tentativo di invio da parte del server


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


    /*
    //ritorna data attuale in stringa con formato YYYYMMDD
    function GetDataAttuale_OLD() {
        var dt = new Date();
        var yyyy = dt.getFullYear().toString();
        var mm = (dt.getMonth() + 1).toString();
        var dd = dt.getDate().toString();
        return yyyy + (mm[1] ? mm : "0" + mm[0]) + (dd[1] ? dd : "0" + dd[0]);
    }
    */

}

function QTOrderRow(ArticleBarcode, BaseObj, articoloDescrizione, OggettoCodice, qta, parListinoTestataDescrizione) {
    this.articleBarcode = ArticleBarcode;
    //this.articleObj = ArticleObj;
    this.baseObj = BaseObj;
    this.Descrizione = articoloDescrizione;
    this.OggettoCodice = OggettoCodice;
    this.Qta = qta;

    this.ListinoTestataDescrizione = parListinoTestataDescrizione;

}


function QTOrderUpload(orderCode, orderDate, customerCode, customerDestCode, rows, operatorCode, operatorPsw, orderIndex, orderContatto1, orderAnnotazioni, orderAnnotazioni_interna, orderEMail, orderEMail_interna) {
    this.orderCode = orderCode;
    this.orderDate = orderDate;
    this.customerCode = customerCode;
    this.customerDestCode = customerDestCode;

    this.operatorCode = operatorCode;
    this.operatorPsw = operatorPsw;

    this.rows = rows;
    this.orderIndex = orderIndex; //tengo traccia dell'index nell'array di partenza degli ordini (per successiva rimozione)
    this.orderContatto1 = orderContatto1;
    this.orderAnnotazioni = orderAnnotazioni;
    this.orderAnnotazioni_interna = orderAnnotazioni_interna;
    this.orderEMail = orderEMail;
    this.orderEMail_interna = orderEMail_interna;

    this.device_uuid = device.uuid;
}

function QTOrderRowUpload(articleBarcode, OggettoCodice, qta) {
    this.articleBarcode = articleBarcode;
    this.OggettoCodice = OggettoCodice;
    this.Qta = qta;
    //alert("QTOrderRowUpload Qta " + this.Qta)
    //alert("QTOrderRowUpload OggettoCodice " + this.OggettoCodice)
}

function QTOrderList() {
    var __fileName = "QTOrders.txt";

    //dichiaro array vuoto
    this.orders = [];


    this.deleteFile = function () {
        FileExists(__fileName, function (fileExists) {
            if (fileExists) {
                FileDelete(__fileName, function () {
                    //     alert("cancellato");
                }, function (e) {
                    alert("Errore cancellazione configurazione: " + e.toString());
                })
            } else {
                //   alert("file non esiste x cancellarlo");
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







/*
-----------------------------------------------------------------------------------
---------------------------------MailClienteManager---------------------------------
-----------------------------------------------------------------------------------
*/


function MailClienteManager() {

    var __fileName = "QTMailClienteManager.txt";

    this.Elenco = [];

    MailClienteManager.prototype.Add = function (CodiceCliente, MailString) {
        try {


            var cliList = SEARCHJS.matchArray(this.Elenco, { "CodiceCliente": CodiceCliente });
            var cli = null;

            if (cliList.length == 0) {

                cli = new MailCliente(CodiceCliente);
                this.Elenco.push(cli)
            } else {

                cli = cliList[0];


            }

            this.gestisciMail(cli, MailString);
            this.saveToFile();

        } catch (e) {
            alert("ERRORE MailClienteManager.prototype.Add: " + e.message);
        }
    }



    this.gestisciMail = function (cli, MailString) {
        //function Aggiungi(MailString) {
        try {


            MailString = MailString.replace(new RegExp(" ", "g"), "");
            MailString = MailString.replace(new RegExp(";", "g"), "§");
            MailString = MailString.replace(new RegExp(",", "g"), "§");
            var elencomail = MailString.split("§");
            for (i = 0 ; i < elencomail.length ; i++) {
                var m = elencomail[i].trim();

                if (validateEmail(m) == true) {
                    if (cli.Mail.indexOf(m) == -1) {
                        cli.Mail.push(m);
                    }
                }
            }


        } catch (e) {
            alert("ERRORE MailClienteManager.gestisciMail: " + e.message);
        }
    }





    this.deleteFile = function () {
        FileExists(__fileName, function (fileExists) {
            if (fileExists) {
                FileDelete(__fileName, function () {
                    //  alert("cancellato");
                }, function (e) {
                    alert("Errore cancellazione profilo: " + e.toString());
                })
            } else {
                //   alert("file non esiste x cancellarlo");
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
                  JSON.stringify(this.Elenco),
                  Success,
                  Fail);
    }


}

function MailCliente(myCodiceCliente) {
    this.CodiceCliente = myCodiceCliente;
    this.Mail = [];     //elenco delle mail

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
        $.mobile.pageContainer.pagecontainer("change", pageTarget, { transition: "slide", reverse: true });
    } else {
        $.mobile.pageContainer.pagecontainer("change", pageTarget, { transition: "slide" });
    }
}


function PageChange_OriginaleAlessandro(pageTarget, isBack) {
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
    t = ReplaceAll(t, "ù", "\u00f9");
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


//----------------------------------------------------------------------------------------------------
//------------------------------------------DANIELE BARLOCCO------------------------------------------
//------------------------------------- calcolo del prezzo offline (in sviluppo)---------------------


function ObjGruppi_OffLineStructure() {

    this.Elenco = [];


    ObjGruppi_OffLineStructure.prototype.Load = function (fullDS, baseCodice, listinoCodice) {

        try {

            //alert("baseCodice: " + baseCodice);
            //alert("listinoCodice: " + listinoCodice);


            //RESET
            this.Elenco = [];

            var myListiniTestata = SEARCHJS.matchArray(fullDS.dataSource.ListiniTestata_SoloBarCode, { "BaseCodice": baseCodice });

            for (var i1 = 0; i1 < myListiniTestata.length; i1++) {
                var listino = myListiniTestata[i1];

                if (listino.CntPrezzi > 0) {

                    var item = new ObjGruppi_OffLineStructure_Item();
                    item.BaseCodice = listino.BaseCodice;
                    item.Gruppo = listino.Gruppo;
                    item.Descrizione = listino.Descrizione;

                    var myListiniCorpo = SEARCHJS.matchArray(fullDS.dataSource.listiniCorpo, { "BaseCodice": baseCodice, "Gruppo": item.Gruppo }, { _not: true, "Ordine": 999 });

                    for (var i2 = 0; i2 < myListiniCorpo.length; i2++) {
                        var articolo = new ObjGruppi_OffLineStructure_Item_Articolo();
                        articolo.Progressivo = myListiniCorpo[i2].Progressivo;
                        articolo.Descrizione = myListiniCorpo[i2].Descrizione;
                        articolo.TipoArticolo = myListiniCorpo[i2].TipoArticolo;
                        articolo.ProdottoCampione = myListiniCorpo[i2].ProdottoCampione;
                        articolo.Finissaggio = myListiniCorpo[i2].Finissaggio;
                        articolo.Colore = myListiniCorpo[i2].ColoreCodice;
                        articolo.Variante = myListiniCorpo[i2].Variante;
                        articolo.Disegno = myListiniCorpo[i2].DisegnoCodice;

                        ObjGruppi_OffLineStructure.prototype.GetPrice(fullDS, baseCodice, listinoCodice, articolo);

                        item.Articoli.push(articolo);


                    }

                    this.Elenco.push(item);
                }
            }

        } catch (e) {
            alert("ERRORE ObjGruppi_OffLineStructure.prototype.Load: " + e.message);
        }


    }


    ObjGruppi_OffLineStructure.prototype.GetPrice = function (fullDS, baseCodice, listinoCodice, articolo) {
        try {
            var FIND_PLUS = "++++";

            var strnomecampo2 = "";
            var strValoreCampo2 = "";
            var strTono = "";
            var strVarianteTono = "";

            alert("baseCodice- " + baseCodice);
            alert("listinoCodice- " + listinoCodice);
            alert("TipoArticolo- " + articolo.TipoArticolo);
            //alert("Colore- " + articolo.Colore);
            alert("Variante- " + articolo.Variante);
            alert("Disegno- " + articolo.Disegno);

            if (articolo.TipoArticolo == "TP") {
                strnomecampo2 = "ColoreCodice";
                strValoreCampo2 = articolo.Colore;
                strVarianteTono = "GG" + baseCodice + articolo.Colore;

            } else if (articolo.TipoArticolo == "TF") {
                strnomecampo2 = "Variante";
                strValoreCampo2 = articolo.Variante;
                strVarianteTono = "GG" + baseCodice + articolo.Variante;
            }
            else if (articolo.TipoArticolo == "TS") {
                strnomecampo2 = "Variante";
                strValoreCampo2 = articolo.Variante;
                strVarianteTono = "MS" + baseCodice + articolo.Disegno + articolo.Variante;
            }

            //alert("strVarianteTono: " + strVarianteTono);

            var SrcToni = SEARCHJS.matchArray(fullDS.dataSource.ArticoliVarianteTono, { "Variante": strVarianteTono });
            if (SrcToni.length > 0) {
                strTono = SrcToni(0).Tono;
            }

            //alert("strTono: " + strTono);
            alert("ProdottoCampione- " + articolo.ProdottoCampione);
            alert("Finissaggio- " + articolo.Finissaggio);



            var myListiniAzienda_main = SEARCHJS.matchArray(fullDS.dataSource.ListiniAzienda,
                {
                    "ListinoCodice": listinoCodice, "TipoArticolo": articolo.TipoArticolo,
                    "BaseCodice": baseCodice, "ProdottoCampione": articolo.ProdottoCampione, "Finissaggio": articolo.Finissaggio
                });


            alert("myListiniAzienda_main len: " + myListiniAzienda_main.length);

            if (articolo.TipoArticolo == "TP" || articolo.TipoArticolo == "TF") {


                /*
                strSQL1 = strSQL & "DisegnoCodice ='" & Disegno & "'" & NS_AND_WITH_SPACE & strnomecampo2 & " ='" & strValoreCampo2 & "'"
                strSQL2 = strSQL & "DisegnoCodice ='" & Disegno & "'" & NS_AND_WITH_SPACE & strnomecampo2 & " ='" & strValoreCampo2 & "'" & NS_AND_WITH_SPACE & strSQLTono & "='" & strTono & "'"
                strSQL3 = strSQL & "DisegnoCodice ='" & Disegno & "'" & NS_AND_WITH_SPACE & strnomecampo2 & " ='" & FIND_PLUS & "'" & NS_AND_WITH_SPACE & strSQLTono & "='" & "+" & "'"
                strSQL3b = strSQL & "DisegnoCodice ='" & FIND_PLUS & "'" & NS_AND_WITH_SPACE & strnomecampo2 & " ='" & strValoreCampo2 & "'" & NS_AND_WITH_SPACE & strSQLTono & "='" & strTono & "'"
                strSQL4 = strSQL & "DisegnoCodice ='" & FIND_PLUS & "'" & NS_AND_WITH_SPACE & strnomecampo2 & " ='" & strValoreCampo2 & "'"
                strSQL5 = strSQL & "DisegnoCodice ='" & FIND_PLUS & "'" & NS_AND_WITH_SPACE & strnomecampo2 & " ='" & FIND_PLUS & "'" & NS_AND_WITH_SPACE & strSQLTono & "='" & strTono & "'"
                strSQL6 = strSQL & "DisegnoCodice ='" & FIND_PLUS & "'" & NS_AND_WITH_SPACE & strnomecampo2 & " ='" & FIND_PLUS & "'" & NS_AND_WITH_SPACE & strSQLTono & "='" & "+" & "'"
                */

                var myListiniAzienda_TP_TS_01 = SEARCHJS.matchArray(myListiniAzienda_main, { "DisegnoCodice": articolo.Disegno, strnomecampo2: strValoreCampo2 })
                alert("myListiniAzienda_TP_TS_01 len: " + myListiniAzienda_TP_TS_01.length);

                var myListiniAzienda_TP_TS_02 = SEARCHJS.matchArray(myListiniAzienda_main, { "DisegnoCodice": articolo.Disegno, strnomecampo2: strValoreCampo2, "Key8": strTono })
                alert("myListiniAzienda_TP_TS_02 len: " + myListiniAzienda_TP_TS_02.length);

                var myListiniAzienda_TP_TS_03 = SEARCHJS.matchArray(myListiniAzienda_main, { "DisegnoCodice": articolo.Disegno, strnomecampo2: FIND_PLUS, "Key8": '+' })
                alert("myListiniAzienda_TP_TS_03 len: " + myListiniAzienda_TP_TS_03.length);

                var myListiniAzienda_TP_TS_03B = SEARCHJS.matchArray(myListiniAzienda_main, { "DisegnoCodice": FIND_PLUS, strnomecampo2: strValoreCampo2, "Key8": strTono })
                alert("myListiniAzienda_TP_TS_03B len: " + myListiniAzienda_TP_TS_03B.length);

                var myListiniAzienda_TP_TS_04 = SEARCHJS.matchArray(myListiniAzienda_main, { "DisegnoCodice": FIND_PLUS, strnomecampo2: strValoreCampo2 })
                alert("myListiniAzienda_TP_TS_04 len: " + myListiniAzienda_TP_TS_04.length);

                var myListiniAzienda_TP_TS_05 = SEARCHJS.matchArray(myListiniAzienda_main, { "DisegnoCodice": FIND_PLUS, strnomecampo2: FIND_PLUS, "Key8": strTono })
                alert("myListiniAzienda_TP_TS_05 len: " + myListiniAzienda_TP_TS_05.length);

                var myListiniAzienda_TP_TS_06 = SEARCHJS.matchArray(myListiniAzienda_main, { "DisegnoCodice": FIND_PLUS, strnomecampo2: FIND_PLUS, "Key8": '+' })
                alert("myListiniAzienda_TP_TS_06 len: " + myListiniAzienda_TP_TS_06.length);

            }
            else if (articolo.TipoArticolo == "TS") {

            }






        } catch (e) {
            alert("ERRORE ObjGruppi_OffLineStructure.prototype.GetPrice: " + e.message);
        }
    }



}

function ObjGruppi_OffLineStructure_Item() {
    this.BaseCodice = null;
    this.Gruppo = null;
    this.Descrizione = null;
    this.Articoli = [];

}

function ObjGruppi_OffLineStructure_Item_Articolo() {
    this.Progressivo = null;
    this.Descrizione = null;
    this.TipoArticolo = null;
    this.ProdottoCampione = null;
    this.Finissaggio = null;
    this.Colore = null;
    this.Variante = null;
    this.Disegno = null;


    this.Prezzi = [];

}

function ObjGruppi_OffLineStructure_Item_Articolo_Prezzo() {
    this.Price = null;
    this.FinoA = null;
}



//ritorna data attuale in stringa con formato YYYYMMDD
function GetDataAttuale() {
    var dt = new Date();
    var yyyy = dt.getFullYear().toString();
    var mm = (dt.getMonth() + 1).toString();
    var dd = dt.getDate().toString();

    var hh = dt.getHours().toString();
    var nn = dt.getMinutes().toString();
    var ss = dt.getSeconds().toString();

    var result = yyyy + (mm[1] ? mm : "0" + mm[0]) + (dd[1] ? dd : "0" + dd[0]);
    var result2 = yyyy + (mm[1] ? mm : "0" + mm[0]) + (dd[1] ? dd : "0" + dd[0]) + (hh[1] ? hh : "0" + hh[0]) + (nn[1] ? nn : "0" + nn[0]) + (ss[1] ? ss : "0" + ss[0])


    return result2
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





/*
Oggetto articolo per selezione guidata articolo
*/
function ArticoloSelezioneGuidata() {
    this.BaseCodice = null;
    this.Gruppo = null;
    this.ArticoloCodice = [];
}



/*
Tronca numero a N decimali
*/
function TroncaDecimali(Numero, digits) {
    var re = new RegExp("(\\d+\\.\\d{" + digits + "})(\\d)"),
        m = Numero.toString().match(re);
    return m ? parseFloat(m[1]) : Numero.valueOf();
};


function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}



function sortByKey(array, key) {
    return array.sort(function (a, b) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}





/*CODICE DIF RIFERIMENTO X CHECK SERVER ONLINE

    ServerOnlineVerify(function () {
        //ONLINE, niente da notificare
    }, function (textStatus, textError) {
        //OFFLINE-ERRORE
        navigator.notification.alert("Il server Quick Trade non \u00e8 raggiungibile, non \u00e8 possibile eseguire l'operazione.", function () {
            return;
        }, "Attenzione", "OK");
    });



*/