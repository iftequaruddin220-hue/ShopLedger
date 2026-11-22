// Date utilities for ShopLedger (Indian DD/MM/YYYY format)

function pad2(n) {
  return ('0' + n).slice(-2);
}

exports.today = function () {
  var d = new Date();
  return pad2(d.getDate()) + '/' + pad2(d.getMonth() + 1) + '/' + d.getFullYear();
};

// Added for date-picker filtering (Vikram, Oct 2021)
// Accepts either DD/MM/YYYY or YYYY-MM-DD and returns a sortable YYYY-MM-DD key.
exports.normalizeDateKey = function (str) {
  if (!str) return '';
  var s = String(str).trim();
  var parts;
  var year;
  var month;
  var day;

  if (s.indexOf('-') !== -1) {
    // HTML5 input[type="date"] sends YYYY-MM-DD.
    parts = s.split('-');
    if (parts.length !== 3) return '';
    year = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10);
    day = parseInt(parts[2], 10);
  } else {
    // Stored order dates use DD/MM/YYYY.
    parts = s.split('/');
    if (parts.length !== 3) return '';
    day = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10);
    year = parseInt(parts[2], 10);
  }

  if (!year || month < 1 || month > 12 || day < 1 || day > 31) return '';
  var date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return '';
  return year + '-' + pad2(month) + '-' + pad2(day);
};

exports.getFiscalYear = function (dateStr) {
  var s = exports.normalizeDateKey(dateStr);
  var parts = s.split('-');
  if (parts.length !== 3) return 'FY21-22';
  var year = parseInt(parts[0], 10);
  var month = parseInt(parts[1], 10);
  if (month >= 4) {
    return 'FY' + String(year).slice(-2) + '-' + String(year + 1).slice(-2);
  }
  return 'FY' + String(year - 1).slice(-2) + '-' + String(year).slice(-2);
};
