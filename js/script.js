// ★★★★☆
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
        App.on_init_render_delicious();
        App.on_init_render_lastfm();
        App.on_init_render_fotkiyandexru();
        App.on_init_render_twitter();
        App.on_init_render_linkedin();
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

            var vars = {
                name: 'Github repositories:',
                link_to_all: 'http://github.com/msoap',
                items: github_data.data.map(function(i) {

                    var urls = [];
                    if (i.homepage.length) {
                        urls.push({title: "home", url: i.homepage})
                    };
                    urls.push({title: "repo", url: i.html_url});
                    if (i.has_wiki) {
                        urls.push({title: "wiki", url: i.html_url + '/wiki'})
                    };

                    return {
                        title: i.description,
                        description: i.description,
                        urls: urls,
                        date: new Date(i.updated_at).toLocaleDateString()
                    };
                })
            };

            App.render_any('div#github', vars, "script#tmpl_links_block_github");
        });
    },

    on_init_render_delicious: function() {
        // http://delicious.com/developers
        $.getJSON("http://feeds.delicious.com/v2/json/msoap?callback=?", {
        }, function(delicious_data) {

            var vars = {
                name: 'Last delicious links:',
                link_to_all: 'http://delicious.com/msoap',
                items: delicious_data.map(function(i) {
                    return {
                        title: i.d,
                        description: i.n,
                        url: i.u,
                        date: new Date(i.dt).toLocaleDateString()
                    };
                })
            };

            App.render_any('div#delicious', vars);
        });
    },

    on_init_render_lastfm: function() {
        // http://www.lastfm.ru/api/show/user.getRecentTracks
        $.getJSON("http://ws.audioscrobbler.com/2.0/?callback=?", {
            "method": "user.getRecentTracks",
            "format": "json",
            "user": "msoap",
            "api_key": "f013c46eeee32be481c90eb2c79378c5"
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

    on_init_render_fotkiyandexru: function() {
        // http://api.yandex.ru/fotki/doc/operations-ref/all-photos-collection-get.xml
        $.getJSON("http://api-fotki.yandex.ru/api/users/msoap/photos/?callback=?", {
            "limit": 10,
            "format": "json"
        }, function(yaphotki_data) {

            var vars = {
                without_url: true,
                name: 'Last photos:',
                link_to_all: 'http://fotki.yandex.ru/users/msoap/',
                items: yaphotki_data.entries.filter(function(e, i) {
                    return i < 15 ? true : false;
                }).map(function(i) {
                    return {
                        title: i.title,
                        description: i.description,
                        url: i.links.alternate,
                        date: new Date(i.published).toLocaleDateString()
                    };
               })
            };

            App.render_any('div#fotkiyandexru', vars);
        });
    },

    on_init_render_twitter: function() {
        // https://dev.twitter.com/docs/api/1/get/statuses/user_timeline
        $.getJSON("https://api.twitter.com/1/statuses/user_timeline.json?callback=?", {
            "include_entities": "false",
            "include_rts": "false",
            "screen_name": "msoap",
            "count": 10
        }, function(twitter_data) {

            var vars = {
                without_url: true,
                name: 'Last twits, one twit per year:)',
                link_to_all: 'http://twitter.com/msoap',
                items: twitter_data.map(function(i) {
                    return {
                        title: i.text,
                        description: '',
                        url: "http://twitter.com/#!/msoap/status/" + i.id_str,
                        date: new Date(i.created_at).toLocaleDateString()
                    };
                })
            };

            App.render_any('div#twitter', vars);
        });
    },

    on_init_render_linkedin: function() {
        // add Linkedin button
        $('div#linkedin_div').append(
            '<script src="http://platform.linkedin.com/in.js" type="text/javascript"></script>' +
            '<script type="IN/MemberProfile" data-id="http://www.linkedin.com/in/mudrik" data-format="click" data-related="false"></script>'
        );

        $("div#linkedin_div").one("mouseenter mouseleave", function() {
            $("span.IN-widget a.li-connect-link").append('<span style="color: black; font-size: 70%; text-decoration: none;">Linkedin<span>');
            $(this).unbind('mouseenter mouseleave');
        });
    },

    // -------- render any block ---------
    render_any: function(where_selector, vars, template) {
        if (! template)
            template = "script#tmpl_links_block";
        $(template).tmpl(vars).appendTo(where_selector);
    }
};
