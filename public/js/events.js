/**
 * Created by Dylan on 16-Apr-17.
 */

Vue.component('plb-template', {
    template: "#pleaderboard-template",
    props:['current'],
    methods: {
        updateBoard: function(stat) {
            eventHub.$emit('plead', stat);
        }
    }
});

Vue.component('olb-template', {
    template: "#oleaderboard-template",
    props:['current', 'id'],
    methods: {
        updateBoard: function(stat) {
            eventHub.$emit('olead', stat);
        }
    }
});

var eventHub = new Vue();

new Vue({
    el: '#app',
    data: {
        event: {},
        pCurrent: {
            stat: "",
            players: []
        },
        oCurrent: {
            stat: "",
            outfits: []
        },
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
                vthis.pCurrent.players = data;
                vthis.pCurrent.stat = capitalise(stat);
            })
        },
        getOutfitLeaderboard: function(id, stat) {
            var url = "/api/outfit_leaderboard?event_id=" + id + "&stat=" + stat + "&limit=50";
            var vthis = this;
            $.ajax({
                dataType: "jsonp",
                url: url
            }).done(function (data) {
                vthis.oCurrent.outfits = data;
                vthis.oCurrent.stat = capitalise(stat);
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
        },
        updatePLeaderboard: function(stat) {
            console.log(stat);
            this.getPlayerLeaderboard(this.event.id, stat);
        },
        updateOLeaderboard: function(stat) {
            console.log("here");
            this.getOutfitLeaderboard(this.event.id, stat);
        }
    },
    created: function() {
        eventHub.$on('plead', this.updatePLeaderboard);
        eventHub.$on('olead', this.updateOLeaderboard);
    },
    deleted: function() {
        eventHub.$off('plead', this.updatePLeaderboard);
        eventHub.$off('olead', this.updateOLeaderboard);
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

function capitalise(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}