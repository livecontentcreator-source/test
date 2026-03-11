/**
 * UNILAV TRACKER SYNC
 *
 * Questo script sincronizza la sezione inferiore del foglio "UNILAV TRACKER"
 * con i lavori dal "REGISTRO PRESENZE" che NON sono coperti dall'intervallo
 * UNILAV di ciascun creator.
 *
 * SETUP:
 * 1. Apri il foglio Google → Estensioni → Apps Script
 * 2. Incolla questo codice
 * 3. Salva e autorizza
 * 4. Esegui syncUnilavTracker() oppure usa il menu personalizzato
 */

// ============ CONFIGURAZIONE ============
var CONFIG = {
  // Nomi dei fogli (modificare se diversi)
  REGISTRO_SHEET: 'REGISTRO PRESENZE',
  TRACKER_SHEET: 'UNILAV TRACKER',

  // Colonne del REGISTRO PRESENZE (1-indexed)
  REG_DATA_INIZIO: 2,    // Colonna B - DATA INIZIO
  REG_DATA_FINE: 3,       // Colonna C - DATA FINE
  REG_CREATOR: 4,         // Colonna D - CREATOR
  REG_LAVORO: 5,          // Colonna E - LAVORO/CLIENTE
  REG_GIORNI: 6,          // Colonna F - GIORNI

  // Colonne della sezione TOP del TRACKER (1-indexed)
  TRACKER_CREATOR: 1,     // Colonna A - CREATOR
  TRACKER_UNILAV_DAL: 2,  // Colonna B - UNILAV DAL
  TRACKER_UNILAV_AL: 3,   // Colonna C - UNILAV AL

  // Riga di inizio della sezione TOP (dopo l'header)
  TRACKER_TOP_START_ROW: 2,
  // Numero massimo di creator nella sezione top
  TRACKER_TOP_MAX_ROWS: 20,

  // Riga di inizio della sezione BOTTOM (lavori non coperti)
  // Verrà calcolata automaticamente cercando l'header della sezione
  TRACKER_BOTTOM_HEADER_TEXT: 'CREATOR', // Testo dell'header della sezione bottom

  // Colonne della sezione BOTTOM del TRACKER
  BOT_CREATOR: 1,
  BOT_DATA_LAVORO: 2,
  BOT_LAVORO: 3,
  BOT_GG_AL_LAVORO: 4,
  BOT_UNILAV_SCADE: 5,
  BOT_COPERTO: 6,
  BOT_ALERT: 7,
  BOT_COSA_FARE: 8,
  BOT_UNILAV_FATTA: 9
};

/**
 * Crea il menu personalizzato quando si apre il foglio
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('🔄 UNILAV Tracker')
    .addItem('Sincronizza lavori non coperti', 'syncUnilavTracker')
    .addItem('Sincronizza (solo futuri)', 'syncUnilavTrackerFutureOnly')
    .addToUi();
}

/**
 * FUNZIONE PRINCIPALE: Sincronizza tutti i lavori non coperti
 */
function syncUnilavTracker() {
  _syncTracker(false);
}

/**
 * Sincronizza solo i lavori futuri non coperti
 */
function syncUnilavTrackerFutureOnly() {
  _syncTracker(true);
}

/**
 * Logica principale di sincronizzazione
 * @param {boolean} futureOnly - Se true, mostra solo lavori futuri
 */
function _syncTracker(futureOnly) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var registroSheet = ss.getSheetByName(CONFIG.REGISTRO_SHEET);
  var trackerSheet = ss.getSheetByName(CONFIG.TRACKER_SHEET);

  if (!registroSheet || !trackerSheet) {
    SpreadsheetApp.getUi().alert(
      'Errore: Foglio "' + CONFIG.REGISTRO_SHEET + '" o "' + CONFIG.TRACKER_SHEET + '" non trovato.'
    );
    return;
  }

  var oggi = new Date();
  oggi.setHours(0, 0, 0, 0);

  // 1. Leggi i dati UNILAV dalla sezione TOP del tracker
  var unilavMap = _getUnilavData(trackerSheet);

  // 2. Leggi tutti i lavori dal Registro Presenze
  var lavori = _getRegistroData(registroSheet);

  // 3. Filtra: tieni solo i lavori NON coperti dall'UNILAV
  var lavoriNonCoperti = [];

  for (var i = 0; i < lavori.length; i++) {
    var lavoro = lavori[i];
    var creatorKey = lavoro.creator.toUpperCase().trim();

    // Salta lavori senza data (mensili senza date specifiche)
    if (!lavoro.dataInizio) continue;

    // Se futureOnly, salta lavori passati
    if (futureOnly && lavoro.dataInizio < oggi) continue;

    var unilav = unilavMap[creatorKey];
    var coperto = false;
    var unilavScade = 'NESSUNA';

    if (unilav && unilav.dal && unilav.al) {
      unilavScade = unilav.al;
      // Il lavoro è coperto se TUTTE le date del lavoro cadono nell'intervallo UNILAV
      if (lavoro.dataInizio >= unilav.dal && lavoro.dataFine <= unilav.al) {
        coperto = true;
      }
    }

    // Aggiungi alla lista solo se NON coperto
    if (!coperto) {
      var ggAlLavoro = Math.ceil((lavoro.dataInizio - oggi) / (1000 * 60 * 60 * 24));

      var alert, cosaFare;
      if (!unilav || !unilav.dal) {
        alert = '🔴 URGENTE!';
        cosaFare = 'Fare UNILAV per ' + lavoro.creator + ' prima del ' + _formatDate(lavoro.dataInizio);
      } else if (lavoro.dataInizio < unilav.dal) {
        alert = '🔴 NON COPERTO';
        cosaFare = 'Lavoro prima dell\'inizio UNILAV (' + _formatDate(unilav.dal) + '). Estendere UNILAV.';
      } else {
        alert = '🔴 NON COPERTO';
        cosaFare = 'UNILAV scade il ' + _formatDate(unilav.al) + ', lavoro il ' + _formatDate(lavoro.dataInizio) + '. Rinnovare UNILAV!';
      }

      lavoriNonCoperti.push({
        creator: lavoro.creator,
        dataLavoro: lavoro.dataInizio,
        lavoro: lavoro.lavoro,
        ggAlLavoro: ggAlLavoro,
        unilavScade: unilavScade,
        coperto: '🔴 NON COPERTO',
        alert: alert,
        cosaFare: cosaFare
      });
    }
  }

  // 4. Ordina per data lavoro, poi per creator
  lavoriNonCoperti.sort(function(a, b) {
    var dateDiff = a.dataLavoro - b.dataLavoro;
    if (dateDiff !== 0) return dateDiff;
    return a.creator.localeCompare(b.creator);
  });

  // 5. Scrivi i risultati nella sezione BOTTOM del tracker
  _writeBottomSection(trackerSheet, lavoriNonCoperti, unilavMap);

  // 6. Notifica
  var msg = 'Sincronizzazione completata!\n\n';
  if (lavoriNonCoperti.length === 0) {
    msg += '✅ Tutti i lavori sono coperti da UNILAV!';
  } else {
    msg += '⚠ Trovati ' + lavoriNonCoperti.length + ' lavori NON coperti da UNILAV.';
  }
  SpreadsheetApp.getUi().alert(msg);
}

/**
 * Legge i dati UNILAV dalla sezione TOP del tracker
 * @returns {Object} Mappa creator -> {dal, al}
 */
function _getUnilavData(sheet) {
  var data = sheet.getDataRange().getValues();
  var map = {};

  // Cerca la prima riga con dati (dopo l'header)
  for (var i = 0; i < Math.min(data.length, CONFIG.TRACKER_TOP_START_ROW + CONFIG.TRACKER_TOP_MAX_ROWS); i++) {
    var row = data[i];
    var creator = String(row[CONFIG.TRACKER_CREATOR - 1]).toUpperCase().trim();

    // Salta header e righe vuote
    if (!creator || creator === 'CREATOR' || creator === '') continue;

    var dal = row[CONFIG.TRACKER_UNILAV_DAL - 1];
    var al = row[CONFIG.TRACKER_UNILAV_AL - 1];

    if (dal instanceof Date && al instanceof Date) {
      dal.setHours(0, 0, 0, 0);
      al.setHours(0, 0, 0, 0);
      map[creator] = { dal: dal, al: al };
    } else {
      // Creator senza UNILAV
      map[creator] = { dal: null, al: null };
    }
  }

  return map;
}

/**
 * Legge i lavori dal Registro Presenze
 * @returns {Array} Lista di {creator, dataInizio, dataFine, lavoro, giorni}
 */
function _getRegistroData(sheet) {
  var data = sheet.getDataRange().getValues();
  var lavori = [];

  for (var i = 1; i < data.length; i++) { // Salta header
    var row = data[i];
    var creator = String(row[CONFIG.REG_CREATOR - 1]).toUpperCase().trim();
    var dataInizio = row[CONFIG.REG_DATA_INIZIO - 1];
    var dataFine = row[CONFIG.REG_DATA_FINE - 1];
    var lavoro = String(row[CONFIG.REG_LAVORO - 1]).trim();
    var giorni = row[CONFIG.REG_GIORNI - 1];

    // Salta righe vuote o header
    if (!creator || creator === 'CREATOR' || creator === '' || lavoro === '') continue;

    // Gestisci date
    if (dataInizio instanceof Date) {
      dataInizio.setHours(0, 0, 0, 0);
    } else {
      dataInizio = null;
    }

    if (dataFine instanceof Date) {
      dataFine.setHours(0, 0, 0, 0);
    } else {
      dataFine = dataInizio; // Se non c'è data fine, usa data inizio
    }

    lavori.push({
      creator: creator,
      dataInizio: dataInizio,
      dataFine: dataFine || dataInizio,
      lavoro: lavoro,
      giorni: giorni || 1
    });
  }

  return lavori;
}

/**
 * Trova la riga di inizio della sezione BOTTOM nel tracker
 */
function _findBottomSectionStart(sheet) {
  var data = sheet.getDataRange().getValues();
  var foundFirstHeader = false;

  for (var i = 0; i < data.length; i++) {
    var cellValue = String(data[i][0]).toUpperCase().trim();
    if (cellValue === 'CREATOR') {
      if (foundFirstHeader) {
        return i + 1; // Riga 1-indexed (la riga dopo il secondo header "CREATOR")
      }
      foundFirstHeader = true;
    }
  }

  // Se non trovata, posiziona dopo la sezione top (con un po' di spazio)
  return CONFIG.TRACKER_TOP_START_ROW + CONFIG.TRACKER_TOP_MAX_ROWS + 3;
}

/**
 * Scrive la sezione BOTTOM con i lavori non coperti
 */
function _writeBottomSection(sheet, lavoriNonCoperti, unilavMap) {
  var bottomStart = _findBottomSectionStart(sheet);

  // Pulisci la sezione bottom (dalle righe dati, non l'header)
  var dataStartRow = bottomStart + 1; // +1 per saltare l'header
  var lastRow = sheet.getLastRow();

  if (lastRow >= dataStartRow) {
    sheet.getRange(dataStartRow, 1, lastRow - dataStartRow + 1, 9).clearContent();
    sheet.getRange(dataStartRow, 1, lastRow - dataStartRow + 1, 9).clearFormat();
  }

  if (lavoriNonCoperti.length === 0) {
    sheet.getRange(dataStartRow, 1).setValue('✅ Tutti i lavori sono coperti da UNILAV!');
    sheet.getRange(dataStartRow, 1, 1, 9).merge();
    sheet.getRange(dataStartRow, 1).setFontWeight('bold')
      .setHorizontalAlignment('center')
      .setBackground('#d9ead3');
    return;
  }

  // Scrivi i dati
  var output = [];
  for (var i = 0; i < lavoriNonCoperti.length; i++) {
    var l = lavoriNonCoperti[i];
    output.push([
      l.creator,
      l.dataLavoro,
      l.lavoro,
      l.ggAlLavoro,
      (l.unilavScade instanceof Date) ? l.unilavScade : l.unilavScade,
      l.coperto,
      l.alert,
      l.cosaFare,
      '' // UNILAV FATTA? - da compilare manualmente
    ]);
  }

  var range = sheet.getRange(dataStartRow, 1, output.length, 9);
  range.setValues(output);

  // Formattazione
  // Date format
  sheet.getRange(dataStartRow, 2, output.length, 1).setNumberFormat('dd/MM/yyyy');
  sheet.getRange(dataStartRow, 5, output.length, 1).setNumberFormat('dd/MM/yyyy');

  // Colori di sfondo per le righe non coperte
  for (var j = 0; j < output.length; j++) {
    var rowRange = sheet.getRange(dataStartRow + j, 1, 1, 9);
    var l = lavoriNonCoperti[j];

    if (l.alert.indexOf('URGENTE') !== -1) {
      rowRange.setBackground('#f4c7c3'); // Rosso chiaro
    } else {
      rowRange.setBackground('#fce5cd'); // Arancione chiaro
    }
  }
}

/**
 * Formatta una data in formato dd/mm/yyyy
 */
function _formatDate(date) {
  if (!(date instanceof Date)) return String(date);
  var dd = ('0' + date.getDate()).slice(-2);
  var mm = ('0' + (date.getMonth() + 1)).slice(-2);
  var yyyy = date.getFullYear();
  return dd + '/' + mm + '/' + yyyy;
}

/**
 * Trigger automatico: esegue la sincronizzazione ogni volta che il foglio viene modificato
 * Per attivarlo: Estensioni → Apps Script → Trigger → Aggiungi trigger → onEdit
 * NOTA: usa installable trigger, non simple trigger, per accedere a tutti i fogli
 */
function onEditTrigger(e) {
  var sheetName = e.source.getActiveSheet().getName();

  // Sincronizza solo se viene modificato il Registro Presenze o la sezione TOP del tracker
  if (sheetName === CONFIG.REGISTRO_SHEET || sheetName === CONFIG.TRACKER_SHEET) {
    // Evita loop: non rieseguire se la modifica è nella sezione bottom del tracker
    if (sheetName === CONFIG.TRACKER_SHEET) {
      var editRow = e.range.getRow();
      var bottomStart = _findBottomSectionStart(e.source.getSheetByName(CONFIG.TRACKER_SHEET));
      if (editRow >= bottomStart) return; // Modifica nella sezione bottom, ignora
    }

    _syncTracker(false);
  }
}
