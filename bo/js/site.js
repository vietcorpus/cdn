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