export default function ({
  id,
  sheetNumber = 1,
  query = '',
  useIntegers = true,
  showRows = true,
  showColumns = true,
}) {
  const url = `https://spreadsheets.google.com/feeds/list/${id}/${sheetNumber}/public/values?alt=json`;

  return fetch(url, {
    method: 'GET',
  })
    .then(response => response.json())
    .then((data) => {
      const responseObj = {};
      const rows = [];
      const columns = {};

      for (let i = 0; i < data.feed.entry.length; i += 1) {
        const entry = data.feed.entry[i];
        const keys = Object.keys(entry);
        const newRow = {};
        let queried = false;

        for (let j = 0; j < keys.length; j += 1) {
          const gsxCheck = keys[j].indexOf('gsx$');
          if (gsxCheck > -1) {
            const key = keys[j];
            const name = key.substring(4);
            const content = entry[key];
            let value = content.$t;

            if (value.toLowerCase().indexOf(query.toLowerCase()) > -1) {
              queried = true;
            }

            if (useIntegers && !Number.isNaN(Number(value))) {
              value = Number(value);
            }

            newRow[name] = value;

            if (queried) {
              if (!Object.prototype.hasOwnProperty.call(columns, name)) {
                columns[name] = [];
                columns[name].push(value);
              } else {
                columns[name].push(value);
              }
            }
          }
        }

        if (queried) {
          rows.push(newRow);
        }
      }
      if (showColumns) {
        responseObj.columns = columns;
      }

      if (showRows) {
        responseObj.rows = rows;
      }

      return responseObj;
    })
    .catch((error) => {
      throw new Error(`Spreadsheet to JSON: There has been a problem with your fetch operation: ${error.message}`);
    });
}
