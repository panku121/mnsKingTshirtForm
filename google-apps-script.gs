function doPost(e) {
  try {
    var SHEET_NAME = "mnsKings";
    var HEADERS = [
      "Timestamp",
      "Player Name",
      "Phone Number",
      "Name on Tshirt",
      "Tshirt Size",
      "Number on back",
      "Sleeve Length"
    ];

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
    }

    var p = e.parameter || {};
    var firstRow = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
    var hasHeader = firstRow.some(function (cell) {
      return String(cell).trim() !== "";
    });

    if (!hasHeader) {
      sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    }

    var row = [
      new Date(),
      p.playerName || "",
      p.phoneNumber || "",
      p.nameOnTshirt || "",
      p.tshirtSize || "",
      p.numberOnBack || "",
      p.sleeveLength || ""
    ];

    var nextRow = sheet.getLastRow() + 1;
    sheet.getRange(nextRow, 3).setNumberFormat("@");
    sheet.getRange(nextRow, 6).setNumberFormat("@");
    sheet.getRange(nextRow, 1, 1, row.length).setValues([row]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, message: "Saved successfully" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}