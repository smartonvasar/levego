    function loadData(target, titleText, xAxisText, yAxisText, nodeIds, fieldNames, granulation, legends) {
        return $.ajax({
            type: "GET",
            url: 'https://api.iotguru.cloud/measurement/loadByNodeIds/' + nodeIds + '/' + fieldNames + '/' + granulation,
            dataType: "json",
            success: function (data) {
                processData(target, titleText, xAxisText, yAxisText, granulation, data, legends);
            }
        });
    }

    function processData(target, titleText, xAxisText, yAxisText, granulation, data, legends) {
        var options = {
            time: {
                timezone: 'Europe/Budapest'
            },
            title: {
                text: titleText
            },
            chart: {
                zoomType: 'xy',
                type: 'spline',
                renderTo: target,
                events: {
                    load: function () {
                    },
                    redraw: function () {
                    }
                }
            },
            xAxis: {
                type: 'datetime',
                title: {
                    text: xAxisText
                },
                gridLineWidth: 1,
                tickInterval: 3600 * 1000
            },
            yAxis: {
                title: {
                    text: yAxisText
                },
                plotBands: [{ // Light air
                    from: 0,
                    to: 25,
                    color: 'rgba(0, 200, 0, 0.1)'
                }]
            },
            tooltip: {
                xDateFormat: '%Y-%m-%d %H:%M',
                shared: true
            },
            plotOptions: {
                spline: {
                    lineWidth: 2,
                    states: {
                        hover: {
                            lineWidth: 3
                        }
                    },
                    marker: {
                        enabled: false
                    },
                    enableMouseTracking: true,
                    dataLabels: {
                        enabled: false,
                        borderRadius: 2,
                        backgroundColor: 'rgba(255, 255, 255, 0.75)',
                        borderWidth: 1,
                        borderColor: '#888',
                        x: 48,
                        formatter: function () {
                            if (granulation === 'DAY/288') {
                                if (this.x === this.series.data[this.series.data.length - 1].x || this.x === this.series.data[0].x) {
                                    return this.series.name + ': ' + Math.round(this.y * 10) / 10 + ' ' + yAxisText;
                                } else {
                                    return null;
                                }
                            }
                        }
                    }
                }
            },
            series: [{}]
        };

        for (var i = 0; i < data.length; i++) {
            options.series[i] = {data: {}, name: {}};
            /* options.series[i].name = data[i]["name"]; */
            options.series[i].name = legends[i];
            options.series[i].data = data[i]["data"].sort(function (a, b) {
                return a[0] - b[0];
            });
        }

        var chart = new Highcharts.Chart(options);
        if (window.location.hash.indexOf('filter') > 0) {
            for (i = 0; i < chart.series.length; i++) {
                if (window.location.hash.indexOf(chart.series[i].name) <= 0) {
                    chart.series[i].setVisible(false, false);
                }
            }
            chart.redraw();
        }
    }

    $(document).ready(function () {

        var granularity = 'day';
        var nodeIds1 = 'j6SXje7B1NlWuGxgoFYR6g,j6SXje7B1NlWuGxgoFYR6g';
        var nodeIds2 = 'lV0lVM0xrQyATqegqlIR6g,lV0lVM0xrQyATqegqlIR6g';
        var nodeIds3 = 'vzofJwY5SZredRBAqnkR6g,vzofJwY5SZredRBAqnkR6g';
        var nodeIds4 = 'vzofJwY5SZonGiugqnoR6g,vzofJwY5SZonGiugqnoR6g';
        var filedNames = 'pm10,pm25';
        var nodeIdsVoluntary01 = 'pGG1Q1HEfK76tqKA-xwR6Q,pGG1Q1HEfK76tqKA-xwR6Q';
        var nodeIdsLocationCompare = 'j6SXje7B1NlWuGxgoFYR6g,lV0lVM0xrQyATqegqlIR6g,vzofJwY5SZredRBAqnkR6g,vzofJwY5SZonGiugqnoR6g,pGG1Q1HEfK76tqKA-xwR6Q';
        var filedNamesAll25 = 'pm25,pm25,pm25,pm25,pm25';
        var filedNamesAll10 = 'pm10,pm10,pm10,pm10,pm10';
        var displayNamesAll = ['box01', 'box02', 'box03', 'box04', 'vol01'];
        var displayNames = ['pm10', 'pm25'];

        function load() {
            let gran = '';
            if (granularity === 'day') {
                gran = 'DAY/288';
            }
            if (granularity === 'week') {
                    gran = 'WEEK/168';
            }
            if (granularity === 'month') {
                gran = 'MONTH/240';
            }
            if (granularity === 'year') {
                gran = 'YEAR/366';
            }

            loadData('graphAverage-box-1', 'box01', 'idő', 'μg/m³', nodeIds1, filedNames, gran, displayNames);
            loadData('graphAverage-box-2', 'box02', 'idő', 'μg/m³', nodeIds2, filedNames, gran, displayNames);
            loadData('graphAverage-box-3', 'box03', 'idő', 'μg/m³', nodeIds3, filedNames, gran, displayNames);
            loadData('graphAverage-box-4', 'box04', 'idő', 'μg/m³', nodeIds4, filedNames, gran, displayNames);
            loadData('graphAverage-voluntary-01', 'voluntary-01', 'idő', 'μg/m³', nodeIdsVoluntary01, filedNames, gran, displayNames);
            loadData('graphAverage-all-25', 'PM25', 'idő', 'μg/m³', nodeIdsLocationCompare, filedNamesAll25, gran, displayNamesAll);
            loadData('graphAverage-all-10', 'PM10', 'idő', 'μg/m³', nodeIdsLocationCompare, filedNamesAll10, gran, displayNamesAll);

            setTimeout(function () {
                load();
            }, 150000);
        }

        $('#daily').click(function () {
            granularity = 'day';
            load();
        });
        $('#weekly').click(function () {
            granularity = 'week';
            load();
        });
        $('#monthly').click(function () {
            granularity = 'month';
            load();
        });
        $('#yearly').click(function () {
            granularity = 'year';
            load();
        });

        load();
    });
