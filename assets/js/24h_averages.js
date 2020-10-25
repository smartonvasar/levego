$(document).ready(function () {
    let weeklydata = loadWeeklyData(nodeIdsLocationCompare, filedNamesAll10);
    weeklydata.always(function (data) {
        calculateAverages(data);
        calculateChanges('24h_avg_24', '24h_avg_48');
        calculateChanges('24h_avg_48', '24h_avg_72');
    });

    let dailydata = loadDailyData(nodeIdsLocationCompare, filedNamesAll10);
    dailydata.always(function (data) {
        calculateDailyAverages(data);
        calculateChanges('1h_avg_1', '1h_avg_2');
        calculateChanges('1h_avg_2', '1h_avg_3');
    });
});

function calculateChanges(currentId, previousId) {
    let current = $("#" + currentId).text();
    let previous = $("#" + previousId).text();
    let direction;
    if (current > previous) {
        direction = '<i class="red-text small material-icons">file_upload</i>';
    } else if (current < previous) {
        direction = '<i class="green-text small material-icons">file_download</i>';
    } else {
        direction = '<i class="small material-icons">forward</i>';
    }
    let percent = Math.abs(Math.round(10000 * (previous - current) / previous))/100 + '%';

    $("#" + currentId + "_direction").html(direction);
    $("#" + currentId + "_changepercent").text(percent);

    //console.log(currentId, current, previous, percent);
}

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
        $('#1h_avg_' + interval + '_start').html(moment(avg.start).format("YYYY-MM-DD HH:mm"));
        $('#1h_avg_' + interval + '_end').html(moment(avg.end).format("YYYY-MM-DD HH:mm"));
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
