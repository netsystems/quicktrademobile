function FileExists(FileNameWithExtension, Success, Fail) {
    try {
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,
            function (_fs) {
                _fs.root.getFile(FileNameWithExtension, {},
                                function () {
                                    Success(true);
                                },function () {
                                    Success(false);
                                });
            },
        Fail);
    } catch (e) {
        Fail(e);
    }
}

function FileRead(FileNameWithExtension, Success, Fail) {
    try {
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,
            function (_fs) {
            _fs.root.getFile(FileNameWithExtension, {}, function (fileEntry) {
                fileEntry.file(function (file) {
                    var reader = new FileReader();
                    reader.onloadend = function (e) {
                        Success(this.result.toString());
                    };
                    reader.readAsText(file);
                }, Fail);


            }, Fail);

        },
        Fail);
    } catch (e) {
        Fail(e);
    }
}

function FileWrite(FileNameWithExtension, Text, Success, Fail, ShowProgress, ProgressText) {
    try {
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,
            function (_fs) {
                _fs.root.getFile(FileNameWithExtension, { create: true, exclusive: false }, function (fileEntry) {
                    fileEntry.createWriter(function (fileWriter) {
                        /*fileWriter.onwriteend = function (e) {
                            Success();
                        };*/
                        fileWriter.onerror = function (e) {
                            Fail(e);
                        };
                        // Create a new Blob and write it to log.txt.
                        var blob = new Blob([Text], { type: "text/plain" });

                        //Non uso più la scrittura dell'intero blob ma pacchettizzo in blocchi da 100KB(0.1MB) dando anche un progress.
                        //fileWriter.write(blob);
                        //definisco metodo di scrittura pacchettizzato
                        var written = 0;
                        var BLOCK_SIZE = 0.1 * 1024 * 1024;
                        var blobSize = (Math.round((blob.size/1024/1024)*10)/10).toString();
                        function writeNext(callbackFinish) {
                            try {
                                //CALCOLO PERC
                                if (ShowProgress) {
                                    $(".ui-loader h1").text(ProgressText.toString().replace("[PROGRESS]", parseInt((written * 100) / blob.size).toString() + "%\n(" + blobSize + " MB)"));
                                    $(".ui-loader h1").html($(".ui-loader h1").html().replace(/\n/g,"<br/>"));
                                }
                                var sz = Math.min(BLOCK_SIZE, blob.size - written);
                                var sub = blob.slice(written, written + sz);
                                fileWriter.write(sub);
                                written += sz;
                                fileWriter.onwrite = function (evt) {
                                    if (written < blob.size) {
                                        writeNext(callbackFinish);
                                    } else {
                                        callbackFinish();
                                    }
                                }
                            } catch (e) {
                                alert("Errore writeNext: " + e.message);
                            }
                        }

                        //avvio scrittura
                        writeNext(Success);


                    }, Fail);
                }, Fail);
            },
            Fail);
    } catch (e) {
        Fail(e);
    }
}

function FileDelete(FileNameWithExtension, Success, Fail) {
    try {
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0,
            function (_fs) {
                _fs.root.getFile(FileNameWithExtension, {}, function (fileEntry) {
                    fileEntry.remove(function () {
                        Success();
                    }, Fail);
                }, Fail);
            },
        Fail);
    } catch (e) {
        Fail(e);
    }
}

//La funzione passato un errore di FileSYstem restituisce un messaggio di errore parlante.
//      e:          oggetto errore
function FileGetErrorMessage(e) {
    var msg = "";

    if (e.code) {
        switch (e.code) {
            case 5: //ENCODING_ERR
                msg = "URL incompleto o non valido (code: ENCODING_ERR)";
                break;
            case FileError.INVALID_MODIFICATION_ERR:
                msg = "La modifica richiesta non e' consentita (code: INVALID_MODIFICATION_ERR)";
                break;
            case FileError.INVALID_STATE_ERR:
                msg = "L'operazione richiesta non può essere effettuata nello stato corrente dell'oggetto di interfaccia (code: INVALID_STATE_ERR)";
                break;
            case 6: //NO_MODIFICATION_ALLOWED_ERR
                msg = "Lo stato della file system in uso non consente la scrittura di file o directory (code: NO_MODIFICATION_ALLOWED_ERR)";
                break;
            case FileError.NOT_FOUND_ERR:
                msg = "Il file richiesto non e' stato trovato (code: NOT_FOUND_ERR)";
                break;
            case 4: //NOT_READABLE_ERR
                msg = "Il file non può essere letto, potrebbe essere un problema di permessi (code: NOT_READABLE_ERR)";
                break;
            case 12: //PATH_EXISTS_ERR
                msg = "Esiste gia' un file o directory con il percorso specificato (code: PATH_EXISTS_ERR)";
                break;
            case FileError.QUOTA_EXCEEDED_ERR:
                msg = "Lo spazio di memorizzazione non e' sufficiente (code: QUOTA_EXCEEDED_ERR)";
                break;
            case FileError.SECURITY_ERR:
                msg = "L'accesso al file e' negato (code: SECURITY_ERR)";
                break;
            default:
                msg = 'Errore sconosciuto (code: ' + e.code.toString() + ')';
                break;
        };
    } else {
        //errore std js
        msg = e.message;
    }

    return msg;
}