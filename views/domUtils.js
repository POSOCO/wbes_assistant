/**
 * Created by Nagasudhir on 12/10/2017.
 */
function createTable(tableData, tableEl) {
    // delete all table rows
    while (tableEl.rows.length > 0) {
        tableEl.deleteRow(0);
    }
    tableData.forEach(function (rowData) {
        var row = document.createElement('tr');

        rowData.forEach(function (cellData) {
            var cell = document.createElement('td');
            cell.appendChild(document.createTextNode(cellData));
            row.appendChild(cell);
        });

        tableEl.appendChild(row);
    });
}