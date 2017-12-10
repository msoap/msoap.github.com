"use strict";

$(function() {
    App.init();
});

var App = {
    init: function() {

        // set active buttons on navbar
        $('div#navbar ul.nav li a').click(App.on_click_navbar);
        setTimeout(App.on_init_set_active, 10);

        // render
        App.on_init_render_github();
        App.on_init_render_github_gists();
        App.on_init_render_lastfm();

        // svg fallback
        if (! window.SVGSVGElement) {
            $('img#avatar')[0].src = 'img/avatar.png'
        };

        // update year
        var date = new Date
          , year = date.getFullYear();
        if (year > 2000) {
            $('p#copyright').html("&copy; " + year);
        };

        setTimeout(function() {
            var im_counter = new Image();
            im_counter.src = "https://msoap.space/user_counter"
        }, 5000);
    },

    on_init_set_active: function() {
        var hash = document.location.hash.replace(/^#/, '');
        if (hash.length && $('div#' + hash).length) {
            $('div#navbar ul.nav li').removeClass('active');
            $('div#navbar ul.nav li a[href=#' + hash + ']').parent('li').addClass('active');
        }
    },

    on_click_navbar: function() {
        $(this).parents('ul').find('li').removeClass('active');
        $(this).parent('li').addClass('active');
    },

    // ------- render -------
    on_init_render_github: function() {
        // http://developer.github.com/v3/
        // https://api.github.com/users/msoap/events
        $.getJSON("https://api.github.com/users/msoap/repos?callback=?", {
            "format": "json"
        }, function(github_data) {

            if (github_data.meta && github_data.meta.status != 200) {
                $("div#github").remove()
                return;
            };

            var items = github_data.data.map(function(i) {
                var urls = [];
                if (i.homepage && i.homepage.length) {
                    urls.push({title: "home", url: i.homepage})
                };
                urls.push({title: "repository", url: i.html_url});
                if (i.has_wiki) {
                    urls.push({title: "wiki", url: i.html_url + '/wiki'})
                };

                return {
                    title: i.description,
                    description: i.description,
                    urls: urls,
                    date: new Date(i.updated_at).toLocaleDateString(),
                    stargazers_count: i.stargazers_count,
                    language: i.language,
                    date_raw: i.updated_at,
                };
            });

            // with stars and newest - first
            items.sort(function(a, b) {
                var by_stars = b.stargazers_count - a.stargazers_count
                if (by_stars != 0) {
                    return by_stars;
                }
                return a.date_raw > b.date_raw
                       ? -1
                       : a.date_raw < b.date_raw
                         ? 1
                         : 0
            });

            var vars = {
                link_to_all: 'https://github.com/msoap',
                items: items
            };

            App.render_any('div#github', vars, "script#tmpl_links_block_github");
        });
    },

    on_init_render_github_gists: function() {
        // http://developer.github.com/v3/gists/
        // https://api.github.com/users/msoap/gists
        $.getJSON("https://api.github.com/users/msoap/gists?callback=?", {
            "format": "json"
        }, function(github_gists_data) {

            if (github_gists_data.meta && github_gists_data.meta.status != 200) {
                $("div#github").remove()
                return;
            };

            var vars = {
                name: 'Github gists:',
                link_to_all: 'https://gist.github.com/msoap',
                items: github_gists_data.data.map(function(i) {
                    var file_name = i.description;
                    for (var key in i.files) {
                        file_name = key + " — " + i.description;
                        break;
                    }
                    return {
                        title: file_name,
                        description: i.description,
                        url: i.html_url,
                        date: new Date(i.updated_at).toLocaleDateString()
                    };
                })
            };

            App.render_any('div#github', vars);
        });
    },

    on_init_render_lastfm: function() {
        // http://www.lastfm.ru/api/show/user.getRecentTracks
        $.getJSON("https://ws.audioscrobbler.com/2.0/?callback=?", {
            "method": "user.getRecentTracks",
            "format": "json",
            "user": "msoap",
            "api_key": "f013c46eeee32be481c90eb2c79378c5",
            "limit": 15
        }, function(lastfm_data) {

            var vars = {
                without_url: true,
                name: 'Recently Listened Tracks:',
                link_to_all: 'http://www.lastfm.ru/user/msoap',
                items: lastfm_data.recenttracks.track.map(function(i) {
                    return {
                        title: i.name,
                        description: [i.artist["#text"], i.album["#text"]].join(" / "),
                        url: i.url,
                        date: i['date'] ? new Date(i.date.uts * 1000).toLocaleDateString() : new Date().toLocaleDateString()
                    };
                })
            };

            App.render_any('div#lastfm', vars);
        });
    },

    // -------- render any block ---------
    render_any: function(where_selector, vars, template) {
        if (! template)
            template = "script#tmpl_links_block";
        $(template).tmpl(vars).appendTo(where_selector);
    }
};
