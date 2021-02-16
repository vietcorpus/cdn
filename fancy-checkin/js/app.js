function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}
var CHECKIN_COOKIE = 'Jn#6pp&SW*JYyJy<';
var UPLOADED_FILE = '';
$(function() {
    var isPublic = $('#public').val();
    if ($('#app').length < 1) {
        return;
    }
    new Vue({
        el: '#app',
        delimiters: ['${', '}'],
        data: {
            client: {
                name: ''
            },
            transaction: null,
            operator: null,
            selectedStaffs: [],
            selectedServices: [],
            appoinment: 0,
            checkingPhone: false,
            step: 1,
            refreshTime: 0,
            timer: null,
            phone: '',
            phoneError: '',
            api: '',
            loading: false,
            systemError: false,
            retry: 0,
            retryLimit: 20
        },
        computed: {
            formatedPhone: function() {
                return this.mask(this.phone);
            }
        },
        methods: {
            mask: function(e) {
                var mask = ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];
                return vanillaTextMask.conformToMask(e, mask).conformedValue;
            },
            isValid: function(phone) {
                return phone.length === 10;
            },
            clearPhone: function() {
                this.phone = '';
            },
            covid: function() {
                var signatureRequired = $('#signatureRequired').val(),
                    optional = signatureRequired === 'optional',
                    required = signatureRequired === 'required',
                    askForSignature = optional || required;
                if (askForSignature) {
                    Swal.fire({
                        title: false,
                        html: '<iframe class="covid-iframe" src="/covid?name=' + encodeURIComponent(this.client.name) + '"></iframe>',
                        customClass: 'swal-wide',
                        showCancelButton: false,
                        showConfirmButton: false,
                        allowOutsideClick: optional,
                        showCloseButton: optional
                    });
                }
            },
            keypress: function(i) {
                if (i === -1) {
                    this.phone = this.phone.slice(0, -1);
                } else {
                    if (this.isValid(this.phone)) {
                        return this.submitVerifyPhone();
                    } else {
                        this.phone += i;
                        if (this.isValid(this.phone)) {
                            return this.submitVerifyPhone();
                        }
                    }
                }
            },
            countdown: function() {
                if (isPublic) {
                    return;
                }
                var that = this;
                this.refreshTime = 10;
                this.timer = setInterval(function() {
                    if (that.refreshTime <= 0) {
                        clearInterval(that.timer);
                        that.refresh();
                    } else {
                        that.refreshTime -= 1;
                    }
                }, 1000);
            },
            submitVerifyPhone: function() {
                this.retry = 0;
                this.systemError = false;
                this.checkPhone();
            },
            checkPhone: function() {
                var that = this;
                this.checkingPhone = true;
                that.phoneError = '';
                $.ajax({
                    type: 'POST',
                    url: this.api + '/checkin/phone',
                    data: JSON.stringify({
                        phone: that.phone,
                        operatorId: this.operator._id
                    }),
                    contentType: 'application/json',
                    dataType: 'json'
                }).done(function(e) {
                    that.checkingPhone = false;
                    if (e.error) {
                        that.phoneError = e.error;
                    } else {
                        that.phoneError = '';
                        if (e.client) {
                            that.client = e.client;
                            if (e.transaction) {
                                that.transaction = e.transaction;
                                that.step = 6;
                                that.countdown();
                            } else {
                                that.step = 3;
                                that.covid();
                            }
                            if (isPublic) {
                                setCookie(CHECKIN_COOKIE, that.phone, 365);
                            }
                        } else {
                            that.client = {};
                            that.step = 2;
                        }
                    }
                }).fail(function() {
                    that.retry += 1;
                    if (that.retry < that.retryLimit) {
                        setTimeout(function() {
                            that.checkPhone();
                        }, 1000);
                    } else {
                        that.checkingPhone = false;
                        that.systemError = true;
                        that.phoneError = 'An error occurred, please try again or contact our staff';
                    }
                });
            },
            setName: function() {
                this.step = 3;
                this.covid();
            },
            selectStaff: function(i) {
                this.$set(i, 'selected', !i.selected);
            },
            selectService: function(i) {
                this.$set(i, 'selected', !i.selected);
            },
            submitStaff: function() {
                this.selectedStaffs = this.operator.staffs.filter(function(e) {
                    return e.selected;
                });
                this.step = 5;
            },
            setAppointment: function(i) {
                this.appointment = i;
                this.step = 4;
            },
            back: function() {
                if (this.step === 3 && this.client._id) {
                    this.step -= 2;
                } else {
                    this.step -= 1;
                }
                if (this.step === 1) {
                    $('.slick').slick('slickNext');
                }
            },
            checkin: function() {
                var that = this;
                this.selectedServices = this.operator.services.filter(function(e) {
                    return e.selected;
                });
                this.selectedStaffs = this.selectedStaffs.map(function(e) {
                    return e._id;
                });
                this.selectedServices = this.selectedServices.map(function(e) {
                    return e._id;
                });
                this.loading = true;
                $.ajax({
                    type: 'POST',
                    url: this.api + '/checkin',
                    data: JSON.stringify({
                        phone: this.phone,
                        name: this.client.name,
                        staffs: this.selectedStaffs,
                        services: this.selectedServices,
                        appointment: this.appointment,
                        operatorId: this.operator._id,
                        signature: UPLOADED_FILE
                    }),
                    contentType: 'application/json',
                    dataType: 'json'
                }).done(function(e) {
                    this.loading = false;
                    that.step = 6;
                    that.countdown();
                });
            },
            refresh: function() {
                window.location.href = '/';
            }
        },
        created: function() {
            var that = this;
            this.operator = JSON.parse($('#operator').val());
            this.api = $('#api').val();
            if (isPublic) {
                var phone = getCookie(CHECKIN_COOKIE);
                if (phone) {
                    $.ajax({
                        type: 'POST',
                        url: this.api + '/checkin/phone',
                        data: JSON.stringify({
                            phone: phone,
                            operatorId: this.operator._id
                        }),
                        contentType: 'application/json',
                        dataType: 'json'
                    }).done(function(e) {
                        if (e.client) {
                            that.client = e.client;
                            that.phone = phone;
                            if (e.transaction) {
                                that.transaction = e.transaction;
                                that.step = 6;
                            } else {
                                that.step = 3;
                                that.covid();
                            }
                        }
                    }).fail(function() {
                        setCookie(CHECKIN_COOKIE, '');
                    });
                }
            }
        }
    });
});
$(function() {
    FastClick.attach(document.body);
    $('.slick').slick({
        dots: false,
        arrows: false,
        slidesToShow: 1,
        infinite: true,
        speed: 500,
        fade: true,
        autoplay: true,
        autoplaySpeed: 15000,
        cssEase: 'linear'
    });
    if ($('#fancy-qrcode').length) {
        new QRCode(document.getElementById('fancy-qrcode'), {
            text: $('#fancy-qrcode').attr('data-url'),
            width: 120,
            height: 120,
            colorDark: "#000",
            colorLight: "#fff",
            correctLevel: QRCode.CorrectLevel.H
        });
    }
    //refresh every 29 minutes
    (function() {
        var _id,
            setup = function() {
                clearInterval(_id);
                _id = setTimeout(function() {
                    window.location.reload();
                }, 1740000);
            };
        $(document).on('touchstart touchmove touchend touchcancel click', function() {
            setup();
        });
        setup();
    }());
});
//covid
$(function() {
    if ($('#signature').length > 0) {
        var canvas = document.querySelector('canvas');
        var ratio = Math.max(window.devicePixelRatio || 1, 1);
        canvas.width = canvas.offsetWidth * ratio;
        canvas.height = canvas.offsetHeight * ratio;
        canvas.getContext("2d").scale(ratio, ratio);
        var signaturePad = new SignaturePad(canvas, {
            minWidth: 0.5,
            maxWidth: 3,
            penColor: '#000'
        });
        $('#btnClearSignature').click(function() {
            signaturePad.clear();
        });
        $('#btnSubmitCovid').click(function() {
            if (signaturePad.isEmpty()) {
                $('#covidError').addClass('danger');
                return;
            }
            var img = signaturePad.toDataURL();
            $.ajax({
                type: 'POST',
                url: '/covid',
                data: JSON.stringify({
                    signature: signaturePad.toDataURL()
                }),
                contentType: 'application/json',
                dataType: 'json'
            }).done(function(e) {
                parent.postMessage(e.file, location.origin);
            });
        });
    } else {
        window.addEventListener('message', function(event) {
            UPLOADED_FILE = event.data;
            Swal.close();
        }, true);
    }
});