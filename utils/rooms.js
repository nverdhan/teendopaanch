var rooms = {
    var room : function(){
        return {
                id : '',
                        {
                    status : '',
                    players : []
                }
        }
    },
    var filledRooms : [],
    var emptyRooms : [],
    //owner can close the room
    function newRoom(id, owner){
        var room = new room;
        room.id = id;
        room.status = 'open',
        room.players.push(owner);
        this.emptyRooms.push(id);
    }
    function getEmptyRooms(){
        return this.emptyRooms.pop();
    }
    function joinRoom(id, player){
        var i = this.emptyRooms.indexOf(id);
//        this.room
        room[id].status = 'closed';
        room[id].players.push(player);
        this.emptyRooms.splice(i, 1);
        this.filledRoom.push(id);
        return id;
    }
    
}
