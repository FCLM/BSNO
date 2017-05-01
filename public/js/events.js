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
        },
        sortBy: function (sortKey) {
            eventHub.$emit('sortOLeaderboard', sortKey);
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
        sortBy: function(sortKey) {
          eventHub.$emit('sortAll', sortKey);
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

Vue.component('weapons-used', {
    template: '#weapons-used',
    props: ['current'],
    methods: {

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
            sorted : { key: "kills", asc: false },
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
        sortPLeaderboard: function(sortKey) {
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
        },
        sortOLeaderboard: function(sortKey) {
            if (sortKey === "Outfit") {
                if (this.oCurrent.sorted.key === sortKey && this.oCurrent.sorted.asc === true) {
                    this.oCurrent.sorted.asc = false;
                    this.oCurrent.outfits.sort(function (a, b) {
                        return b._name.localeCompare(a._name);
                    });
                } else {
                    this.oCurrent.sorted.key = sortKey; this.oCurrent.sorted.asc = true;
                    this.oCurrent.outfits.sort(function (a, b) {
                        return a._name.localeCompare(b._name);
                    });
                }
            }
            else if (sortKey === "Tag") {
                if (this.oCurrent.sorted.key === sortKey && this.oCurrent.sorted.asc === true) {
                    this.oCurrent.sorted.asc = false;
                    this.oCurrent.outfits.sort(function (a, b) {
                        return b._alias.localeCompare(a._alias);
                    });
                } else {
                    this.oCurrent.sorted.key = sortKey; this.oCurrent.sorted.asc = true;
                    this.oCurrent.outfits.sort(function (a, b) {
                        return a._alias.localeCompare(b._alias);
                    });
                }
            }
            else if (sortKey === "Stat") {
                if (this.oCurrent.sorted.key === sortKey && this.oCurrent.sorted.asc === true) {
                    this.oCurrent.sorted.asc = false;
                    this.oCurrent.outfits.sort(function (a, b) {
                        return b.stat - a.stat;
                    });
                } else {
                    this.oCurrent.sorted.key = sortKey; this.oCurrent.sorted.asc = true;
                    this.oCurrent.outfits.sort(function (a, b) {
                        return a.stat - b.stat;
                    });
                }
            }
            else { console.log("Unknown sorting key"); }
        },
        sortAll: function(sortKey) {
            if (this.allCurrent.group === "player") {
                if (sortKey === "Outfit") {
                    if (this.allCurrent.sorted.key === sortKey && this.allCurrent.sorted.asc === true) {
                        this.allCurrent.sorted.key = sortKey; this.allCurrent.sorted.asc = false;
                        this.allCurrent.participants.sort(function (a,b) {
                            return b.o_alias.localeCompare(a.o_alias);
                        });
                    } else {
                        this.allCurrent.sorted.key = sortKey; this.allCurrent.sorted.asc = true;
                        this.allCurrent.participants.sort(function (a,b) {
                            return a.o_alias.localeCompare(b.o_alias);
                        });
                    }
                }
                else if (sortKey === "Player") {
                    if (this.allCurrent.sorted.key === sortKey && this.allCurrent.sorted.asc === true) {
                        this.allCurrent.sorted.key = sortKey; this.allCurrent.sorted.asc = false;
                        this.allCurrent.participants.sort(function (a,b) {
                            return b.name.localeCompare(a.name);
                        });
                    } else {
                        this.allCurrent.sorted.key = sortKey; this.allCurrent.sorted.asc = true;
                        this.allCurrent.participants.sort(function (a,b) {
                            return a.name.localeCompare(b.name);
                        });
                    }
                }
                else if (sortKey === "Kills") {
                    if (this.allCurrent.sorted.key === sortKey && this.allCurrent.sorted.asc === true) {
                        this.allCurrent.sorted.key = sortKey; this.allCurrent.sorted.asc = false;
                        this.allCurrent.participants.sort(function (a,b) {
                            return b.k - a.k;
                        });
                    } else {
                        this.allCurrent.sorted.key = sortKey; this.allCurrent.sorted.asc = true;
                        this.allCurrent.participants.sort(function (a,b) {
                            return a.k - b.k;
                        });
                    }
                }
                else if (sortKey === "Deaths") {
                    if (this.allCurrent.sorted.key === sortKey && this.allCurrent.sorted.asc === true) {
                        this.allCurrent.sorted.key = sortKey; this.allCurrent.sorted.asc = false;
                        this.allCurrent.participants.sort(function (a,b) {
                            return b.d - a.d;
                        });
                    } else {
                        this.allCurrent.sorted.key = sortKey; this.allCurrent.sorted.asc = true;
                        this.allCurrent.participants.sort(function (a,b) {
                            return a.d - b.d;
                        });
                    }
                }
                else if (sortKey === "K/D") {
                    if (this.allCurrent.sorted.key === sortKey && this.allCurrent.sorted.asc === true) {
                        this.allCurrent.sorted.key = sortKey; this.allCurrent.sorted.asc = false;
                        this.allCurrent.participants.sort(function (a,b) {
                            return (b.k/b.d) - (a.k / a.d);
                        });
                    } else {
                        this.allCurrent.sorted.key = sortKey; this.allCurrent.sorted.asc = true;
                        this.allCurrent.participants.sort(function (a,b) {
                            return (a.k / a.d) - (b.k/b.d);
                        });
                    }
                }
                else if (sortKey === "Headshots") {
                    if (this.allCurrent.sorted.key === sortKey && this.allCurrent.sorted.asc === true) {
                        this.allCurrent.sorted.key = sortKey; this.allCurrent.sorted.asc = false;
                        this.allCurrent.participants.sort(function (a,b) {
                            return (b.k/b.h) - (a.k / a.h);
                        });
                    } else {
                        this.allCurrent.sorted.key = sortKey; this.allCurrent.sorted.asc = true;
                        this.allCurrent.participants.sort(function (a,b) {
                            return (a.k / a.h) - (b.k/b.h);
                        });
                    }
                }
            } else if (this.allCurrent.group === "outfit") {
                if (sortKey === "Tag") {
                    if (this.allCurrent.sorted.key === sortKey && this.allCurrent.sorted.asc === true) {
                        this.allCurrent.sorted.key = sortKey; this.allCurrent.sorted.asc = false;
                        this.allCurrent.participants.sort(function (a,b) {
                            return b.alias.localeCompare(a.alias);
                        });
                    } else {
                        this.allCurrent.sorted.key = sortKey; this.allCurrent.sorted.asc = true;
                        this.allCurrent.participants.sort(function (a,b) {
                            return a.alias.localeCompare(b.alias);
                        });
                    }
                }
                else if (sortKey === "Outfit") {
                    if (this.allCurrent.sorted.key === sortKey && this.allCurrent.sorted.asc === true) {
                        this.allCurrent.sorted.key = sortKey; this.allCurrent.sorted.asc = false;
                        this.allCurrent.participants.sort(function (a,b) {
                            return b.name.localeCompare(a.name);
                        });
                    } else {
                        this.allCurrent.sorted.key = sortKey; this.allCurrent.sorted.asc = true;
                        this.allCurrent.participants.sort(function (a,b) {
                            return a.name.localeCompare(b.name);
                        });
                    }
                }
                else if (sortKey === "Members") {
                    if (this.allCurrent.sorted.key === sortKey && this.allCurrent.sorted.asc === true) {
                        this.allCurrent.sorted.key = sortKey; this.allCurrent.sorted.asc = false;
                        this.allCurrent.participants.sort(function (a,b) {
                            return b.members - a.members;
                        });
                    } else {
                        this.allCurrent.sorted.key = sortKey; this.allCurrent.sorted.asc = true;
                        this.allCurrent.participants.sort(function (a,b) {
                            return a.members - b.members;
                        });
                    }
                }
                else if (sortKey === "Kills") {
                    if (this.allCurrent.sorted.key === sortKey && this.allCurrent.sorted.asc === true) {
                        this.allCurrent.sorted.key = sortKey; this.allCurrent.sorted.asc = false;
                        this.allCurrent.participants.sort(function (a,b) {
                            return b.k - a.k;
                        });
                    } else {
                        this.allCurrent.sorted.key = sortKey; this.allCurrent.sorted.asc = true;
                        this.allCurrent.participants.sort(function (a,b) {
                            return a.k - b.k;
                        });
                    }
                }
                else if (sortKey === "Deaths") {
                    if (this.allCurrent.sorted.key === sortKey && this.allCurrent.sorted.asc === true) {
                        this.allCurrent.sorted.key = sortKey; this.allCurrent.sorted.asc = false;
                        this.allCurrent.participants.sort(function (a,b) {
                            return b.d - a.d;
                        });
                    } else {
                        this.allCurrent.sorted.key = sortKey; this.allCurrent.sorted.asc = true;
                        this.allCurrent.participants.sort(function (a,b) {
                            return a.d - b.d;
                        });
                    }
                }
                else if (sortKey === "K/D") {
                    if (this.allCurrent.sorted.key === sortKey && this.allCurrent.sorted.asc === true) {
                        this.allCurrent.sorted.key = sortKey; this.allCurrent.sorted.asc = false;
                        this.allCurrent.participants.sort(function (a,b) {
                            return (b.k/b.d) - (a.k / a.d);
                        });
                    } else {
                        this.allCurrent.sorted.key = sortKey; this.allCurrent.sorted.asc = true;
                        this.allCurrent.participants.sort(function (a,b) {
                            return (a.k / a.d) - (b.k/b.d);
                        });
                    }
                }
                else if (sortKey === "Kills/Member") {
                    if (this.allCurrent.sorted.key === sortKey && this.allCurrent.sorted.asc === true) {
                        this.allCurrent.sorted.key = sortKey; this.allCurrent.sorted.asc = false;
                        this.allCurrent.participants.sort(function (a,b) {
                            return (b.k/b.members) - (a.k / a.members);
                        });
                    } else {
                        this.allCurrent.sorted.key = sortKey; this.allCurrent.sorted.asc = true;
                        this.allCurrent.participants.sort(function (a,b) {
                            return (a.k / a.members) - (b.k/b.members);
                        });
                    }
                }
                else if (sortKey === "Headshots") {
                    if (this.allCurrent.sorted.key === sortKey && this.allCurrent.sorted.asc === true) {
                        this.allCurrent.sorted.key = sortKey; this.allCurrent.sorted.asc = false;
                        this.allCurrent.participants.sort(function (a,b) {
                            return (b.k/b.h) - (a.k / a.h);
                        });
                    } else {
                        this.allCurrent.sorted.key = sortKey; this.allCurrent.sorted.asc = true;
                        this.allCurrent.participants.sort(function (a,b) {
                            return (a.k / a.h) - (b.k/b.h);
                        });
                    }
                }
            }
        }
    },
    created: function() {
        eventHub.$on('plead', this.updatePLeaderboard);
        eventHub.$on('olead', this.updateOLeaderboard);
        eventHub.$on('all', this.updateAll);
        eventHub.$on('sortPLeaderboard', this.sortPLeaderboard);
        eventHub.$on('sortOLeaderboard', this.sortOLeaderboard);
        eventHub.$on('sortAll', this.sortAll);
    },
    beforeDestroy: function() {
        eventHub.$off('plead', this.updatePLeaderboard);
        eventHub.$off('olead', this.updateOLeaderboard);
        eventHub.$off('all', this.updateAll);
        eventHub.$off('sortPLeaderboard', this.sortPLeaderboard);
        eventHub.$off('sortOLeaderboard', this.sortOLeaderboard);
        eventHub.$off('sortAll', this.sortAll);
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