/**
 * Created by Dylan on 16-Apr-17.
 */
new Vue({
    el: '#app',
    data: {
        events: [],
        pop: {}
    },
    methods: {
        getEvents: function() {
            var vthis = this;
            $.ajax({
                dataType: "jsonp",
                url: "/api/events"
            }).done(function(data) {
                vthis.events = data;
                vthis.events.forEach(function (d) {
                    var date = new Date(d.created_at);
                    d.created_at = date.toLocaleDateString("en-AU");
                    d.url = "/events/" + d.id;
                })
            })
        },
        getPop: function() {
            var vthis = this;
            $.ajax({
                dataType: "jsonp",
                url: "/api/current_players"
            }).done(function (pop) {
                vthis.pop = pop
            })
        }
    },
    beforeMount: function() {
        let search = location.search;
        console.log(search);
        if ((search) && (search.substr(0,3) === "?id=")) {
            console.log(search);
        } else {
            console.error("No id found");

        }
        this.getEvents();
        this.getPop();
    }
});