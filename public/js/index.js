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
                console.log(data);
                vthis.events = data;
                console.log(vthis.events);
                vthis.events.forEach(function (d) {
                    var date = new Date(d.created_at);
                    d.created_at = date.toLocaleDateString("en-AU");
                    d.url = "/events/" + d.id;
                })
            })
        },
        getPop: function() {
            var vthis = this
            $.ajax({
                dataType: "jsonp",
                url: "/api/current_players"
            }).done(function (pop) {
                vthis.pop = pop
            })
        }
    },
    beforeMount: function() {
        this.getEvents()
        this.getPop()
    }
})