module.exports = function(client, app, request) {
    app.get('/api/steamid', function(req, res) {
        var st_api_key = req.query.apikey;
        var input = req.query.input;
        // 오브젝트
        let ob = new Object();
        ob.error = false;

        if (!st_api_key && !input || st_api_key == '' || input  == '') return ob.error = true, ob.text = '필수 파라미터 값이 없습니다.', res.json(ob);

        var set2;
        (function convert() { // 변환
            // 32bit || ID3 type --> 64bit
            if (input.trim().indexOf('STEAM_0:') != -1) {
                set2 = to_steam64(input.trim());
            } else if (input.trim().indexOf('U:1:') !=  -1) {
                if (!(/(^\[).*(\]$)+/ig).test(input.trim())) return ob.error = true, ob.text = 'input - Steam3 ID으로 인식되지만 괄호가 빠져 있습니다.', res.json(ob);
                set2 = to_steam3(input.trim());
            } else {
                set2 = input.trim();
            }
        }())
    
        function to_steam64(sid) {
            var _64b = 6561197960265728;
            sid = sid.split(":");
            var x = Number(sid[1]);
            var y = Number(sid[2]);
            _64b += y * 2;
            if (x == 1) _64b += 1;
            return `7${_64b}`;
        }
    
        function to_steam3(sid) {
            var _3b = 0;
            sid = sid.split("[U:1:");
            sid = sid[1].split("]");
            var y = Number(sid[0]);
            _3b = 6561197960265728 + y;
            return `7${_3b}`;
        }

        var bansinfo, bansinfo_ver, ban;
        var url2 = ("http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key="+st_api_key+"&steamids="+set2);
        request.get(url2, function(error, response, body) {
            if (body.indexOf('personaname') == -1) return ob.error = true, ob.text = '결과가 없는 플레이어 이거나 Web Api Key가 잘못되었습니다.', res.json(ob);
            var set3 = (JSON.parse(body));
            var respe = set3.response;
            if (error) return ob.error = true, ob.text = '스팀 API 서버 응답이 없습니다.', res.json(ob);
            ob.steamapi = respe;
            save1();
        });

        function save1() {
            request.get('https://raw.githubusercontent.com/BareungakServer/Barengak-Alliance-Bans/master/db_banlist.json', function(err, response, body) {
                if (err) return ob.barengakbans = {var: 'error', match: null, text: '바른각 데이터베이스로부터 값을 전달 받지 못하였습니다.'}, end();
                bansinfo_ver = (JSON.parse(body))["Ver"];
                let log = body.indexOf(set2);
                if (log == -1) { //중복시 메세지 변경
                    bansinfo = "이 유저는 바른각 연합밴 대상자가 아닙니다", ban = false;
                } else if (log > 0 && body !== null) {
                    bansinfo = "이 유저는 바른각 연합밴 대상자입니다!", ban = true;
                }
                ob.barengakbans = {var: bansinfo_ver, match: ban, text: bansinfo};
                end();
            });
        }

        function end() {
            res.json(ob);
            console.log(ob);
        }
    });
}