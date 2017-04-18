/**
 * Created by Dylan on 16-Apr-17.
 */
new Vue({
    el: '#app',
    data: {
        event: {},
        pCurrent: [],
        oCurrent: [],
        players : [],
        outfits : []
    },
    methods: {
        getEventDetails: function(id) {
            var url = "/api/event?event_id=" + id;
            var vthis = this;
            $.ajax({
                dataType: "jsonp",
                url: url
            }).done(function(data) {
                vthis.event = data;
                var date = new Date(data.created_at);
                vthis.event.date = date.toLocaleDateString("en-AU");
                vthis.event.start = date.toLocaleTimeString("en-AU");
                date = new Date(data.updated_at);
                vthis.event.end = date.toLocaleTimeString("en-AU");
                // When finished, load the data for the tables
                vthis.getPlayerLeaderboard(id, "kills");
                vthis.getOutfitLeaderboard(id, "captures"); // TODO: change to kills
                vthis.getPlayers(id);
            })
        },
        getPlayerLeaderboard: function(id, stat) {
            var url = "/api/player_leaderboard?event_id=" + id + "&stat=" + stat + "&limit=50";
            var vthis = this;
            $.ajax({
                dataType: "jsonp",
                url: url
            }).done(function (data) {
                vthis.pCurrent = data;
            })
        },
        getOutfitLeaderboard: function(id, stat) {
            var url = "/api/outfit_leaderboard?event_id=" + id + "&stat=" + stat + "&limit=50";
            var vthis = this;
            $.ajax({
                dataType: "jsonp",
                url: url
            }).done(function (data) {
                vthis.oCurrent = data;
            })
        },
        getPlayers: function(id) {
            var url = "/api/player_kdh?event_id=" + id;
            var vthis = this;
            $.ajax({
                dataType: "jsonp",
                url: url
            }).done(function (data) {
                vthis.players = data
            })
        }
    },
    beforeMount: function() {
        // Find which event they are after
        let search = location.search;
        let event = 0; // default to first event
        if ((search) && (search.substr(0,4) === "?id=")) {
            event = search.substr(4);
            this.getEventDetails(event);
        } else {
            console.error("No id found");
        }
    }
});