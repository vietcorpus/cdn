/*
 * LetterAvatar
 * 
 * Artur Heinze
 * Create Letter avatar based on Initials
 * based on https://gist.github.com/leecrossley/6027780
 */
(function(w, d) {
    function LetterAvatar(name, size) {
        name = name || '';
        size = size || 60;
        var colours = ['#1abc9c', '#2ecc71', '#3498db', '#8549ba', '#ee4c58', '#16a085', '#27ae60', '#2980b9', '#8e44ad', '#5ecc62', '#f1c40f', '#e67e22', '#e74c3c', '#0ebeff', '#ce1126', '#f39c12', '#d35400', '#c0392b', '#da1884', '#ff4f81', '#1abc9c'],
            nameSplit = String(name).toUpperCase().split(' '),
            initials, charIndex, colourIndex, canvas, context, dataURI;
        if (nameSplit.length == 1) {
            if (nameSplit[0].indexOf('#') >= 0)
                initials = nameSplit[0];
            // initials = nameSplit[0] ? nameSplit[0].charAt(0) : '?';
            else
                initials = nameSplit[0] ? nameSplit[0].substring(0, 2) : '?';
        } else {
            initials = nameSplit[0].charAt(0) + nameSplit[1].charAt(0);
        }
        if (w.devicePixelRatio) {
            size = (size * w.devicePixelRatio);
        }
        if (initials.indexOf('#') >= 0)
            charIndex = initials.slice(1, initials.length);
        else
            charIndex = (initials == '?' ? 72 : initials.charCodeAt(0) > 64 ? initials.charCodeAt(0) : initials + 64) - 64;
        colourIndex = charIndex % colours.length;
        canvas = d.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        context = canvas.getContext('2d');
        context.fillStyle = colours[colourIndex - 1];
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.font = Math.round(canvas.width / 2) - (initials.length === 4 ? 6 : initials.length === 5 ? 10 : 0) + 'px Arial';
        context.textAlign = 'center';
        context.fillStyle = '#FFF';
        context.fillText(initials, size / 2, size / 1.5);

        dataURI = canvas.toDataURL();
        canvas = null;
        return dataURI;
    }

    LetterAvatar.transform = function() {
        Array.prototype.forEach.call(d.querySelectorAll('img[avatar]'), function(img, name) {
            name = img.getAttribute('avatar');
            img.src = LetterAvatar(name, img.getAttribute('width'));
            img.removeAttribute('avatar');
            img.setAttribute('alt', name);
        });
    };

    window.LetterAvatar = LetterAvatar;
    d.addEventListener('DOMContentLoaded', function(event) {
        LetterAvatar.transform();
    });
})(window, document);