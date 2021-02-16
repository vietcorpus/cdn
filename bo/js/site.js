function logout() {
    if (confirm('Are you sure to logout?')) {
        window.location.assign('/logout');
    }
}
//pagination
$(function() {
    if ($('#pagination')) {
        var el = $('#pagination'),
            total = +$(el).attr('total'),
            current = +$(el).attr('current'),
            visiblePages = +$(el).attr('visiblePages');

        function getParameterByName(name, url) {
            if (!url) url = window.location.href;
            name = name.replace(/[\[\]]/g, "\\$&");
            var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
                results = regex.exec(url);
            if (!results) return null;
            if (!results[2]) return '';
            return decodeURIComponent(results[2].replace(/\+/g, " "));
        }

        function updateUrlParameter(uri, key, value) {
            // remove the hash part before operating on the uri
            var i = uri.indexOf('#');
            var hash = i === -1 ? '' : uri.substr(i);
            uri = i === -1 ? uri : uri.substr(0, i);

            var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
            var separator = uri.indexOf('?') !== -1 ? "&" : "?";

            if (!value) {
                // remove key-value pair if value is empty
                uri = uri.replace(new RegExp("([?&]?)" + key + "=[^&]*", "i"), '');
                if (uri.slice(-1) === '?') {
                    uri = uri.slice(0, -1);
                }
                // replace first occurrence of & by ? if no ? is present
                if (uri.indexOf('?') === -1) uri = uri.replace(/&/, '?');
            } else if (uri.match(re)) {
                uri = uri.replace(re, '$1' + key + "=" + value + '$2');
            } else {
                uri = uri + separator + key + "=" + value;
            }
            return uri + hash;
        }

        var goTo = function(page) {
            var current = +(getParameterByName('page') || 1);
            if (page != current) {
                var url = window.location.href;
                // var page = url.split('?')[0] + '?page=' + page;
                var page = updateUrlParameter(url, 'page', page);
                window.location.assign(page);
            }
        }
        if (total > 1) {
            $(el).twbsPagination({
                totalPages: total,
                prev: '<i class="bx bx-chevron-left pagination-icon"></i>',
                next: '<i class="bx bx-chevron-right pagination-icon"></i>',
                startPage: current,
                visiblePages: visiblePages,
                onPageClick: function(event, page) {
                    goTo(page);
                }
            });
        }
    }
    $('.badge-color').each(function() {
        var color = $(this).attr('data-bg');
        var contrast = function(hexcolor) {
            if (!hexcolor) return '';
            // If a leading # is provided, remove it
            if (hexcolor.slice(0, 1) === '#') {
                hexcolor = hexcolor.slice(1);
            }
            // If a three-character hexcode, make six-character
            if (hexcolor.length === 3) {
                hexcolor = hexcolor
                    .split('')
                    .map(function(hex) {
                        return hex + hex;
                    })
                    .join('');
            }
            // Convert to RGB value
            var r = parseInt(hexcolor.substr(0, 2), 16);
            var g = parseInt(hexcolor.substr(2, 2), 16);
            var b = parseInt(hexcolor.substr(4, 2), 16);
            // Get YIQ ratio
            var yiq = (r * 299 + g * 587 + b * 114) / 1000;
            // Check contrast
            return yiq >= 128 ? 'black' : 'white';
        }
        $(this).css('background-color', color);
        $(this).css('color', contrast(color));
    });
});

//transaction page
$(function() {
    $('#btnSearchTransaction').click(function() {
        var keyword = $('#txtSearch').val();
        var date = $('#txtDate').html();
        var url = utils.query('keyword', keyword);
        if (date) {
            url = utils.query('date', date, url);
        }
        window.location.assign(url);
    });
});

//fromNow
$(function() {
    $('.from-now').each(function(e) {
        var date = $(this).attr('data-date');
        var format = moment(date, 'YYYY-MM-DD hh:mm A').fromNow();
        $(this).html(format);
    });
});

var utils = {
    byteLength: function(string) {
        var utf8length = 0;
        for (var n = 0; n < string.length; n++) {
            var c = string.charCodeAt(n);
            if (c < 128) {
                utf8length++;
            } else if ((c > 127) && (c < 2048)) {
                utf8length = utf8length + 2;
            } else {
                utf8length = utf8length + 3;
            }
        }
        return utf8length;
    },
    smsCount: function(e) {
        e = e || '';
        return ~~(utils.byteLength(e) / 130) + 1
    },
    round: function(e) {
        return Math.round((e + Number.EPSILON) * 100) / 100;
    },
    query: function(key, value, uri) {
        uri = uri || window.location.href;
        var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
        var separator = uri.indexOf('?') !== -1 ? "&" : "?";
        if (uri.match(re)) {
            return uri.replace(re, '$1' + key + "=" + value + '$2');
        } else {
            return uri + separator + key + "=" + value;
        }
    }
};

$(document).ready(function() {
    $(window).scroll(function() {
        if ($(this).scrollTop() > 400) {
            $('.scroll-top').fadeIn();
        } else {
            $('.scroll-top').fadeOut();
        }
    });

    //Click event to scroll to top
    $('.scroll-top').click(function() {
        $('html, body').animate({
            scrollTop: 0
        }, 1000);
    });

});

Vue.component('colorpicker', {
    components: {
        'sketch-picker': VueColor.Sketch,
    },
    template: `
<div class="input-group color-picker" ref="colorpicker">
    <input type="text" class="form-control" v-model="colorValue" @focus="showPicker()" @input="updateFromInput" />
    <div class="form-control-position"><i class="bx bxs-color-fill primary"></i></div>
    <span class="input-group-addon color-picker-container">
        <span class="current-color" :style="'background-color: ' + colorValue" @click="togglePicker()"></span>
        <sketch-picker :value="colors" @input="updateFromPicker" v-if="displayPicker" />
    </span>
</div>`,
    props: ['color'],
    data() {
        return {
            colors: {
                hex: '#000000',
            },
            colorValue: '',
            displayPicker: false,
        }
    },
    mounted() {
        this.setColor(this.color || '#000000');
    },
    methods: {
        setColor(color) {
            this.updateColors(color);
            this.colorValue = color;
        },
        updateColors(color) {
            if (color.slice(0, 1) == '#') {
                this.colors = {
                    hex: color
                };
            } else if (color.slice(0, 4) == 'rgba') {
                var rgba = color.replace(/^rgba?\(|\s+|\)$/g, '').split(','),
                    hex = '#' + ((1 << 24) + (parseInt(rgba[0]) << 16) + (parseInt(rgba[1]) << 8) + parseInt(rgba[2])).toString(16).slice(1);
                this.colors = {
                    hex: hex,
                    a: rgba[3],
                }
            }
        },
        showPicker() {
            document.addEventListener('click', this.documentClick);
            this.displayPicker = true;
        },
        hidePicker() {
            document.removeEventListener('click', this.documentClick);
            this.displayPicker = false;
        },
        togglePicker() {
            this.displayPicker ? this.hidePicker() : this.showPicker();
        },
        updateFromInput() {
            this.updateColors(this.colorValue);
        },
        updateFromPicker(color) {
            this.colors = color;
            if (color.rgba.a == 1) {
                this.colorValue = color.hex;
            } else {
                this.colorValue = 'rgba(' + color.rgba.r + ', ' + color.rgba.g + ', ' + color.rgba.b + ', ' + color.rgba.a + ')';
            }
        },
        documentClick(e) {
            var el = this.$refs.colorpicker,
                target = e.target;
            if (el !== target && !el.contains(target)) {
                this.hidePicker()
            }
        }
    },
    watch: {
        colorValue(val) {
            if (val) {
                this.updateColors(val);
                this.$emit('input', val);
            }
        }
    },
});


Vue.directive('select', {
    twoWay: true,
    priority: 1000,
    params: ['options'],
    bind: function() {
        var self = this
        $(this.el)
            .select2({
                data: this.params.options
            })
            .on('change', function() {
                self.set($(self.el).val())
            })
    },
    update: function(value) {
        $(this.el).val(value).trigger('change')
    },
    unbind: function() {
        $(this.el).off().select2('destroy')
    }
});


/* Date-Range*/
$(function() {
    $('.daterange-picker').each(function() {
        var format = function(e) {
            return e.format('YYYY/MM/DD');
        };
        var el = $(this);
        var update = function(start, end) {
            var span = $(el).find('span');
            if (span) {
                $(span).html(format(start) + ' - ' + format(end));
            }
        };
        $(el).daterangepicker({
            startDate: start,
            endDate: end,
            autoUpdateInput: false,
            ranges: {
                'Today': [moment(), moment()],
                'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                'Last 30 Days': [moment().subtract(29, 'days'), moment()],
                'This Month': [moment().startOf('month'), moment().endOf('month')],
                'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
            }
        }, update);

        // update(start, end);
    });

    $('.daterange-hour').each(function() {
        $(this).daterangepicker({
            timePicker: true,
            startDate: moment().startOf('hour'),
            endDate: moment().startOf('hour').add(32, 'hour'),
            locale: {
                format: 'YYYY-MM-DD hh:mm A'
            }
        });
    });

    $('.date-single').each(function() {
        $(this).daterangepicker({
            singleDatePicker: true,
            autoUpdateInput: false,
            drops: 'up'
        }, function(start, end, label) {
            // console.log(moment(start).format('YYYY/MM/DD'));
        });
    });

    //clockpicker
    $('.clockpicker').each(function() {
        var value = $(this).attr('data-value');
        $(this).clockpicker({
            placement: 'bottom',
            align: 'left',
            autoclose: true,
            twelvehour: true,
            'default': value
        });
    });
});

//charts
$(function() {
    /*
        <canvas class="fancy-pie-chart" data-src="#users" data-label="Khách Hàng"></canvas>
        where #users contains stringify of
        users = [
            {
                name: 'New clients',
                count: 342,
                bg: '#ffc168'
            },
            {
                name: 'Regular',
                count: 77,
                bg: '#00aeff'
            }
        ]
    */
    $('.fancy-pie-chart').each(function() {
        var data = $($(this).attr('data-src')).val(),
            label = $(this).attr('data-label');
        if (data) {
            data = JSON.parse(data);
            var config = {
                type: 'pie',
                data: {
                    datasets: data.datasets,
                    labels: data.labels
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: 0,
                    responsiveAnimationDuration: 500
                }
            };
            new Chart($(this)[0].getContext('2d'), config);
        }
    });

    /*
        <canvas class="fancy-line-chart" data-src="#transaction" data-label="blah blah"></canvas>
        where #users contains stringify of
        transactions = {
            x: ['23/3', '24/3', '25/3'],
            y: [
                {
                    label: 'Lượt khách',
                    bg: '#0abf53',
                    border: '#0abf53',
                    data: [12, 42, 36]
                },
                {
                    label: 'SMS',
                    bg: '#d20962',
                    border: '#d20962',
                    data: [22, 26, 24]
                }
            ]
        }
    */
    $('.fancy-line-chart').each(function() {
        var data = $($(this).attr('data-src')).val(),
            label = $(this).attr('data-label'),
            x = $(this).attr('data-x'),
            y = $(this).attr('data-y');
        if (data) {
            data = JSON.parse(data);
            var sets = [];
            for (var i = 0; i < data.y.length; i++) {
                var item = data.y[i];
                var set = {
                    label: item.label,
                    backgroundColor: item.bg,
                    borderColor: item.border,
                    data: item.data,
                    fill: false
                };
                sets.push(set);
            }
            var config = {
                type: 'line',
                data: {
                    labels: data.x,
                    datasets: sets
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: 0,
                    responsiveAnimationDuration: 500,
                    tooltips: {
                        mode: 'index',
                        intersect: false,
                    },
                    hover: {
                        mode: 'nearest',
                        intersect: true
                    },
                    scales: {
                        xAxes: [{
                            display: true,
                            scaleLabel: {
                                display: true,
                                labelString: x
                            }
                        }],
                        yAxes: [{
                            display: true,
                            scaleLabel: {
                                display: true,
                                labelString: y
                            }
                        }]
                    }
                }
            };
            new Chart($(this)[0].getContext('2d'), config);
        }
    });

    /*
        <canvas class="fancy-bar-chart" data-src="#transaction" data-label="blah blah" data-stack="0|1"></canvas>
        where #users contains stringify of
        transactions = {
            x: ['23/3', '24/3', '25/3'],
            y: [
                {
                    label: 'Lượt khách',
                    bg: '#0abf53',
                    border: '#0abf53',
                    data: [12, 42, 36]
                },
                {
                    label: 'SMS',
                    bg: '#d20962',
                    border: '#d20962',
                    data: [22, 26, 24]
                }
            ]
        }
    */
    $('.fancy-bar-chart').each(function() {
        var data = $($(this).attr('data-src')).val(),
            label = $(this).attr('data-label'),
            stack = $(this).attr('data-stack'),
            x = $(this).attr('data-x'),
            y = $(this).attr('data-y');
        if (data) {
            data = JSON.parse(data);
            var sets = [];
            for (var i = 0; i < data.y.length; i++) {
                var item = data.y[i];
                var set = {
                    label: item.label,
                    backgroundColor: item.bg,
                    borderColor: item.border,
                    data: item.data,
                    fill: false
                };
                sets.push(set);
            }
            var config = {
                type: 'bar',
                data: {
                    labels: data.x,
                    datasets: sets
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: 0,
                    responsiveAnimationDuration: 500,
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: label
                    },
                    scales: {
                        xAxes: [{
                            stacked: !!stack
                        }],
                        yAxes: [{
                            stacked: !!stack
                        }]
                    }
                }
            };
            new Chart($(this)[0].getContext('2d'), config);
        }
    });

    /*
        <canvas class="fancy-bar-chart" data-src="#transaction" data-label="blah blah"></canvas>
        where #users contains stringify of
        transactions = {
            x: ['23/3', '24/3', '25/3'],
            y: [
                {
                    label: 'Lượt khách',
                    bg: '#0abf53',
                    border: '#0abf53',
                    data: [12, 42, 36]
                },
                {
                    label: 'SMS',
                    bg: '#d20962',
                    border: '#d20962',
                    data: [22, 26, 24]
                }
            ]
        }
    */
    $('.fancy-doughnut-chart').each(function() {
        var data = $($(this).attr('data-src')).val(),
            label = $(this).attr('data-label');
        if (data) {
            data = JSON.parse(data);
            var config = {
                type: 'doughnut',
                data: {
                    datasets: data.datasets,
                    labels: data.labels
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: 0,
                    responsiveAnimationDuration: 500,
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: label
                    },
                    animation: {
                        animateScale: true,
                        animateRotate: true
                    }
                }
            };
            new Chart($(this)[0].getContext('2d'), config);
        }
    });

    $('.pretty-json').each(function() {
        var ugly = $(this).val();
        console.log(ugly);
        var obj = JSON.parse(ugly);
        var pretty = JSON.stringify(obj, undefined, 4);
        $(this).val(pretty);
    });
});