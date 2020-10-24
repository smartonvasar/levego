$(document).ready(function () {
    let weeklydata = loadWeeklyData(nodeIdsLocationCompare, filedNamesAll10);
    weeklydata.always( function(data){
        calculateAverages(data);
    });

    let dailydata = loadDailyData(nodeIdsLocationCompare, filedNamesAll10);
    dailydata.always( function(data){
        calculateDailyAverages(data);
    });
});

function loadWeeklyData(nodeIds, fieldNames) {
    return $.ajax({
        type: "GET",
        url: 'https://api.iotguru.cloud/measurement/loadByNodeIds/' + nodeIds + '/' + fieldNames + '/WEEK/1',
        dataType: "json"
    });
}
function loadDailyData(nodeIds, fieldNames) {
    return $.ajax({
        type: "GET",
        url: 'https://api.iotguru.cloud/measurement/loadByNodeIds/' + nodeIds + '/' + fieldNames + '/DAY/24',
        dataType: "json"
    });
}


function calculateAverages(data) {
    let avg;
    ["24", "48", "72"].forEach(function (interval) {
        switch (interval) {
            case "24":
                avg = calculateAverage(data, moment(), moment().subtract(25, 'hours'));
                break;
            case "48":
                avg = calculateAverage(data, moment().subtract(24, 'hours'), moment().subtract(49, 'hours'));
                break;
            case "72":
                avg = calculateAverage(data, moment().subtract(48, 'hours'), moment().subtract(73, 'hours'));
                break;
            default:
                console.error("Invalid interval parameter: " + interval);
                break;
        }
        $('#24h_avg_' + interval).text(avg.avg);
        $('#24h_avg_' + interval + '_start').text(moment(avg.start).format("YYYY-MM-DD HH:mm"));
        $('#24h_avg_' + interval + '_end').text(moment(avg.end).format("YYYY-MM-DD HH:mm"));
        $('#24h_avg_' + interval + '_points').text(avg.points);
    });
}

function calculateDailyAverages(data) {
    let avg;
    ["1", "2", "3"].forEach(function (interval) {
        switch (interval) {
            case "1":
                avg = calculateAverage(data, moment(), moment().subtract(1, 'hours'));
                break;
            case "2":
                avg = calculateAverage(data, moment().subtract(1, 'hours'), moment().subtract(2, 'hours'));
                break;
            case "3":
                avg = calculateAverage(data, moment().subtract(2, 'hours'), moment().subtract(3, 'hours'));
                break;
            default:
                console.error("Invalid interval parameter: " + interval);
                break;
        }
        $('#1h_avg_' + interval).text(avg.avg);
        $('#1h_avg_' + interval + '_start').text(moment(avg.start).format("YYYY-MM-DD HH:mm"));
        $('#1h_avg_' + interval + '_end').text(moment(avg.end).format("YYYY-MM-DD HH:mm"));
        $('#1h_avg_' + interval + '_points').text(avg.points);
    });
}

function calculateAverage(data, end, start) {
    let sum = 0;
    let length = 0;
    let first = 0;
    let last = 0;
    let current_timestamp;
    $.each(data, function (index, data) {
        $.each(data.data, function (index, data) {
            current_timestamp = data[0];
            if (moment(current_timestamp) > start && moment(current_timestamp) <= end) {
                sum += data[2];
                length++;
                if (current_timestamp > last) {
                    last = current_timestamp;
                }
                if (current_timestamp < first || first == 0) {
                    first = current_timestamp;
                }
            }
        })
    });

    return {avg: Math.round(sum / length), start: last, end: first, points: length};
}
