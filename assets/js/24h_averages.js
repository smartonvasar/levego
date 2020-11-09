$(document).ready(function () {
    let weeklydata = loadWeeklyData(nodeIdsLocationCompare, fieldNamesAll10);
    weeklydata.always(function (data) {
        let averages = calculateAverages(data, "pm10");
        calculateChanges('24h_avg_24', '24h_avg_48', averages["24"].avg, averages["48"].avg);
        calculateChanges('24h_avg_48', '24h_avg_72', averages["48"].avg, averages["72"].avg);

        calculateChanges('24h_avg_yesterday', '24h_avg_two_days_ago', averages["yesterday"].avg, averages["two_days_ago"].avg);
        calculateChanges('24h_avg_two_days_ago', '24h_avg_three_days_ago', averages["two_days_ago"].avg, averages["three_days_ago"].avg);

    });

    let weeklypm25data = loadWeeklyData(nodeIdsLocationCompare, fieldNamesAll25);
    weeklypm25data.always(function (data) {
        let averages = calculateAverages(data, "pm25");
        calculateChanges('pm25_24h_avg_24', 'pm25_24h_avg_48', averages["24"].avg, averages["48"].avg);
        calculateChanges('pm25_24h_avg_48', 'pm25_24h_avg_72', averages["48"].avg, averages["72"].avg);

        calculateChanges('pm25_24h_avg_yesterday', 'pm25_24h_avg_two_days_ago', averages["yesterday"].avg, averages["two_days_ago"].avg);
        calculateChanges('pm25_24h_avg_two_days_ago', 'pm25_24h_avg_three_days_ago', averages["two_days_ago"].avg, averages["three_days_ago"].avg);

    });

    let dailydata = loadDailyData(nodeIdsLocationCompare, fieldNamesAll10);
    dailydata.always(function (data) {
        let averages = calculateDailyAverages(data, "pm10");
        calculateChanges('1h_avg_1', '1h_avg_2', averages["1"].avg, averages["2"].avg);
        calculateChanges('1h_avg_2', '1h_avg_3', averages["2"].avg, averages["3"].avg);
    });

    let dailypm25data = loadDailyData(nodeIdsLocationCompare, fieldNamesAll25);
    dailypm25data.always(function (data) {
        let averages = calculateDailyAverages(data, "pm25");
        calculateChanges('pm25_1h_avg_1', 'pm25_1h_avg_2', averages["1"].avg, averages["2"].avg);
        calculateChanges('pm25_1h_avg_2', 'pm25_1h_avg_3', averages["2"].avg, averages["3"].avg);
    });
});

function calculateChanges(currentId, previousId, current, previous) {
    let direction;
    /* console.log({currentId, previousId, current, previous}); */
    if (current > previous) {
        direction = '<i class="red-text small material-icons">file_upload</i>';
    } else if (current < previous) {
        direction = '<i class="green-text small material-icons">file_download</i>';
    } else {
        direction = '<i class="small material-icons">forward</i>';
    }
    let percent = Math.abs(Math.round(10000 * (previous - current) / previous)) / 100 + '%';

    $("#" + currentId + "_direction").html(direction);
    $("#" + currentId + "_changepercent").text(percent);

    //console.log(currentId, current, previous, percent);
}

function calculateIndex(measurement, value) {
    switch (measurement) {
        case "pm10":
            if (value < 50) {
                return 0;
            } else if (value < 75) {
                return 1;
            } else if (value < 100) {
                return 2;
            } else if (value >= 100) {
                return 3;
            }
            return undefined;
            break;
        case "pm25":
            if (value < 25) {
                return 0;
            } else if (value < 37.5) {
                return 1;
            } else if (value < 50) {
                return 2;
            } else if (value >= 50) {
                return 3;
            }
            return undefined;
            break;
        default:
            console.error("unknown measurement: " + measurement);
            return "unknown measurement";
    }
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


function calculateAverages(data, dimension) {
    let avg;
    let index;
    let indexClassMap = {
        0: 'green accent-1',
        1: 'yellow accent-1',
        2: 'orange accent-1',
        3: 'red accent-1',
    };
    let averages = {24: null, 48: null, 72: null, yesterday: null, two_days_ago: null, three_days_ago: null};
    ["24", "48", "72", "yesterday", "two_days_ago", "three_days_ago"].forEach(function (interval) {
        switch (interval) {
            case "24":
                avg = calculateAverage(data, moment(), moment().subtract(25, 'hours'));
                averages['24'] = avg;
                break;
            case "48":
                avg = calculateAverage(data, moment().subtract(24, 'hours'), moment().subtract(49, 'hours'));
                averages['48'] = avg;
                break;
            case "72":
                avg = calculateAverage(data, moment().subtract(48, 'hours'), moment().subtract(73, 'hours'));
                averages['72'] = avg;
                break;

            case "yesterday":
                avg = calculateAverage(data, moment().subtract(1, 'days').endOf('day').add(1, 'hours'), moment().subtract(1, 'days').startOf('day').subtract(1, 'hours'));
                averages['yesterday'] = avg;
                break;
            case "two_days_ago":
                avg = calculateAverage(data, moment().subtract(2, 'days').endOf('day').add(1, 'hours'), moment().subtract(2, 'days').startOf('day').subtract(1, 'hours'));
                averages['two_days_ago'] = avg;
                break;
            case "three_days_ago":
                avg = calculateAverage(data, moment().subtract(3, 'days').endOf('day').add(1, 'hours'), moment().subtract(3, 'days').startOf('day').subtract(1, 'hours'));
                averages['three_days_ago'] = avg;
                break;
            default:
                console.error("Invalid interval parameter: " + interval);
                break;
        }

        index = calculateIndex(dimension, avg.avg);

        if (dimension == "pm10") {
            $('#24h_avg_' + interval).closest('.col').addClass(indexClassMap[index]);

            $('#24h_avg_' + interval).html(avg.avg);
            $('#24h_avg_' + interval + '_start').html(moment(avg.start).format("YYYY-MM-DD HH:mm"));
            $('#24h_avg_' + interval + '_end').html(moment(avg.end).format("YYYY-MM-DD HH:mm"));
            $('#24h_avg_' + interval + '_points').text(avg.points);
        } else if (dimension == "pm25") {
            $('#pm25_24h_avg_' + interval).closest('.col').addClass(indexClassMap[index]);

            $('#pm25_24h_avg_' + interval).html(avg.avg);
            $('#pm25_24h_avg_' + interval + '_start').html(moment(avg.start).format("YYYY-MM-DD HH:mm"));
            $('#pm25_24h_avg_' + interval + '_end').html(moment(avg.end).format("YYYY-MM-DD HH:mm"));
            $('#pm25_24h_avg_' + interval + '_points').text(avg.points);
        }
    });

    return averages;
}

function calculateDailyAverages(data, dimension) {
    let avg;
    let averages = {1: null, 2: null, 3: null};
    let indexClassMap = {
        0: 'green accent-1',
        1: 'yellow accent-1',
        2: 'orange accent-1',
        3: 'red accent-1',
    };

    ["1", "2", "3"].forEach(function (interval) {
        switch (interval) {
            case "1":
                avg = calculateAverage(data, moment(), moment().subtract(1, 'hours'));
                averages["1"] = avg;
                break;
            case "2":
                avg = calculateAverage(data, moment().subtract(1, 'hours'), moment().subtract(2, 'hours'));
                averages["2"] = avg;
                break;
            case "3":
                avg = calculateAverage(data, moment().subtract(2, 'hours'), moment().subtract(3, 'hours'));
                averages["3"] = avg;
                break;
            default:
                console.error("Invalid interval parameter: " + interval);
                break;
        }

        index = calculateIndex(dimension, avg.avg);

        if (dimension == "pm10") {
            $('#1h_avg_' + interval).closest('.col').addClass(indexClassMap[index]);

            $('#1h_avg_' + interval).html(avg.avg);
            $('#1h_avg_' + interval + '_start').html(moment(avg.start).format("HH:mm"));
            $('#1h_avg_' + interval + '_end').html(moment(avg.end).format("HH:mm"));
            $('#1h_avg_' + interval + '_points').text(avg.points);
        } else if (dimension == "pm25") {
            $('#pm25_1h_avg_' + interval).closest('.col').addClass(indexClassMap[index]);

            $('#pm25_1h_avg_' + interval).html(avg.avg);
            $('#pm25_1h_avg_' + interval + '_start').html(moment(avg.start).format("HH:mm"));
            $('#pm25_1h_avg_' + interval + '_end').html(moment(avg.end).format("HH:mm"));
            $('#pm25_1h_avg_' + interval + '_points').text(avg.points);
        }
    });

    return averages;
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
