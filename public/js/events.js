/**
 * Created by Dylan on 16-Apr-17.
 */

Vue.component('plb-template', {
    template: "#pleaderboard-template",
    props: ['current'],
    methods: {
        updateBoard: function(stat) {
            eventHub.$emit('plead', stat);
        },
        sortBy: function (sortKey) {
            eventHub.$emit('sortPLeaderboard', sortKey);
        }
    }
});

Vue.component('olb-template', {
    template: "#oleaderboard-template",
    props: ['current'],
    methods: {
        updateBoard: function(stat) {
            eventHub.$emit('olead', stat);
        }
    }
});

Vue.component('all-template', {
   template: "#all-group",
    props: ['current'],
    methods: {
        updateBoard: function (group) {
            eventHub.$emit('all', group);
        },
        // Returns the Kills/Deaths
        kdr: function (k, d) {
            if (k === 0) return 0.0;
            else if (d === 0) return k;
            var kd = k / d;
            return kd.toFixed(1);
        },
        // Returns the kills per member (outfit only)
        kMem: function (k, mem) {
            if (k === 0) return 0.0;
            else if (mem === 1) return k;
            var kmem = k / mem;
            return kmem.toFixed(1);
        },
        // Returns the percentage of kills that were headshots
        hs: function (k, h) {
            if (k === 0 || h === 0) return "0.0%";
            var kd = (h / k) * 100;
            return kd.toFixed(1).toString() + "%";
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
            players: [],
            sorted : { key: "Stat", asc: false },
            menus: [{ name: "kills", capital: "Kills", active: true },
                { name: "deaths", capital: "Deaths", active: false },
                { name: "headshots", capital: "Headshots", active: false },
                { name: "heals", capital: "Heals", active: false },
                { name: "shields", capital: "Shields", active: false },
                { name: "revives", capital: "Revives", active: false },
                { name: "resupplies", capital: "Resupplies", active: false }]
        },
        oCurrent: {
            stat: "",
            outfits: [],
            sorted : { key: "Stat", asc: false },
            menus: [{ name: "kills", capital: "Kills", active: true },
                { name: "deaths", capital: "Deaths", active: false },
                { name: "captures", capital: "Captures", active: false },
                { name: "defenses", capital: "Defenses", active: false }]
        },
        allCurrent : {
            group: "",
            participants: [],
            sorted : { key: "Kills", asc: false },
            menus: [{ name: "player", capital: "All Player Stats", active: true },
                { name: "outfit", capital: "All Outfit Stats", active: false }]
        },
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
                vthis.getParticipants(id, "player");
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
                vthis.pCurrent.menus.forEach(function (menu) {
                    // Menu is active if the menu name is the stat passed in
                    menu.active = menu.name === stat;
                });
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
                vthis.oCurrent.menus.forEach(function (menu) {
                    // Menu is active if the menu name is the stat passed in
                    menu.active = menu.name === stat;
                });
            })
        },
        getParticipants: function(id, group) {
            var url = "/api/participants?event_id=" + id + "&group=" + group;
            var vthis = this;
            $.ajax({
                dataType: "jsonp",
                url: url
            }).done(function (data) {
                vthis.allCurrent.group = group;
                vthis.allCurrent.participants = data;
                vthis.allCurrent.menus.forEach(function (menu) {
                    // Menu is active if the menu name is the stat passed in
                    menu.active = menu.name === group;
                });
            })
        },
        updatePLeaderboard: function(stat) {
            this.getPlayerLeaderboard(this.event.id, stat);
        },
        updateOLeaderboard: function(stat) {
            this.getOutfitLeaderboard(this.event.id, stat);
        },
        updateAll: function(group) {
            this.getParticipants(this.event.id, group);
        },
        sortPLeaderboard(sortKey) {
            if (sortKey === "Outfit") {
                if (this.pCurrent.sorted.key === sortKey && this.pCurrent.sorted.asc === true) {
                    this.pCurrent.sorted.asc = false;
                    this.pCurrent.players.sort(function (a, b) {
                        return b.o_alias.localeCompare(a.o_alias);
                    });
                } else {
                    this.pCurrent.sorted.key = sortKey; this.pCurrent.sorted.asc = true;
                    this.pCurrent.players.sort(function (a, b) {
                        return a.o_alias.localeCompare(b.o_alias);
                    });
                }
            }
            else if (sortKey === "Player") {
                if (this.pCurrent.sorted.key === sortKey && this.pCurrent.sorted.asc === true) {
                    this.pCurrent.sorted.asc = false;
                    this.pCurrent.players.sort(function (a, b) {
                        return b.name.localeCompare(a.name);
                    });
                } else {
                    this.pCurrent.sorted.key = sortKey; this.pCurrent.sorted.asc = true;
                    this.pCurrent.players.sort(function (a, b) {
                        return a.name.localeCompare(b.name);
                    });
                }
            }
            else if (sortKey === "Stat") {
                if (this.pCurrent.sorted.key === sortKey && this.pCurrent.sorted.asc === true) {
                    this.pCurrent.sorted.asc = false;
                    this.pCurrent.players.sort(function (a, b) {
                        return b.stat - a.stat;
                    });
                } else {
                    this.pCurrent.sorted.key = sortKey; this.pCurrent.sorted.asc = true;
                    this.pCurrent.players.sort(function (a, b) {
                        return a.stat - b.stat;
                    });
                }
            }
            else { console.log("Unknown sorting key"); }
        }
    },
    created: function() {
        eventHub.$on('plead', this.updatePLeaderboard);
        eventHub.$on('olead', this.updateOLeaderboard);
        eventHub.$on('all', this.updateAll);
        eventHub.$on('sortPLeaderboard', this.sortPLeaderboard);
    },
    beforeDestroy: function() {
        eventHub.$off('plead', this.updatePLeaderboard);
        eventHub.$off('olead', this.updateOLeaderboard);
        eventHub.$off('all', this.updateAll);
    },
    mounted: function() {
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