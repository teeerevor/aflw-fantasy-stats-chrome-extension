function processTeamStats(teamStats) {
    var playerStats = {};
    teamStats.forEach((player) => {
        var jumperNumber = player.player.jumperNumber;
        var stats = player.playerStats.stats;
        var kicks = stats.kicks;
        var handballs = stats.handballs;
        var marks = stats.marks;
        var hitOuts = stats.hitouts;
        var tackles = stats.tackles;
        var freesAgainst = stats.freesAgainst;
        var freesFor = stats.freesFor;
        var goals = stats.goals;
        var behinds = stats.behinds;
        var points =
            goals * 6 +
            tackles * 4 +
            (kicks + marks) * 3 +
            handballs * 2 +
            hitOuts +
            behinds +
            freesFor -
            freesAgainst * 3;
        playerStats[jumperNumber] = points;
    });
    return playerStats;
}

function removeElementsByClass(className) {
    const elements = document.getElementsByClassName(className);
    while (elements.length > 0) {
        elements[0].parentNode.removeChild(elements[0]);
    }
}

function displayFantasyPoints(homeTeamStats, awayTeamStats) {
    removeElementsByClass('fantasy-header');
    removeElementsByClass('fantasy-points');
    var tables = Array.from(document.getElementsByClassName('mc-player-stats__table'));
    tables.forEach((table, index) => {
        var header = table.children[0].children[0];
        var th = document.createElement('th');
        th.classList.add('mc-player-stats__header-cell', 'fantasy-header');
        th.style.backgroundColor = 'rgba(255, 94, 69, 0.3)';
        var thspan = document.createElement('span');
        thspan.className = 'player-key-stats__header-label';
        thspan.append('Pts');
        th.append(thspan);
        header.append(th);

        var stats = index == 0 ? homeTeamStats : awayTeamStats;
        var rows = Array.from(table.children[1].children);
        rows.forEach((row, rowIndex) => {
            var columns = row.children;
            var playerNumber = columns[0].children[0].children[0].textContent;
            var td = document.createElement('td');
            td.classList.add('mc-player-stats__cell', 'fantasy-points');
            td.style.backgroundColor = `rgba(255, 94, 69, ${rowIndex % 2 ? '0.1' : '0.05'})`;
            td.append(stats[playerNumber]);
            row.append(td);
        });
    });
}

(function (xhr) {
    var XHR = XMLHttpRequest.prototype;

    var open = XHR.open;
    var send = XHR.send;
    var setRequestHeader = XHR.setRequestHeader;

    XHR.open = function (method, url) {
        this._method = method;
        this._url = url;
        this._requestHeaders = {};
        this._startTime = new Date().toISOString();

        return open.apply(this, arguments);
    };

    XHR.setRequestHeader = function (header, value) {
        this._requestHeaders[header] = value;
        return setRequestHeader.apply(this, arguments);
    };

    XHR.send = function (postData) {
        this.addEventListener('load', function () {
            var endTime = new Date().toISOString();
            if (this.responseType == 'json') {
                var data = this.response;
                if (data && data.homeTeamPlayerStats) {
                    var homeTeamPoints = processTeamStats(data.homeTeamPlayerStats);
                    var awayTeamPoints = processTeamStats(data.awayTeamPlayerStats);
                    displayFantasyPoints(homeTeamPoints, awayTeamPoints);
                }
            }
        });

        return send.apply(this, arguments);
    };
})(XMLHttpRequest);
