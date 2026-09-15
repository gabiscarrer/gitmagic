// From my own website(!)
//TODO: only do this for links in the table of contents menu

function find_selflink() {
    var a = document.links;
    // document.links is a live collection. Walk backwards so removing the
    // current link cannot change the indexes that are still to be visited.
    for (var i = a.length - 1; i >= 0; i--) {
        var link = a[i];
        if (link.href == document.URL) {
            var s_new = document.createElement("span");
            s_new.className = "currentlink";
            while (link.firstChild) {
                s_new.appendChild(link.firstChild);
            }
            link.parentNode.replaceChild(s_new, link);
        }
    }
}

find_selflink();
