function processTeamStats(teamStats) {
    var playerStats = {};
    teamStats.forEach((player) => {
        var jumperNumber = player.player.jumperNumber;
        var playerName = player.player.player.playerName;
        var name = `${playerName.firstName} ${playerName.surname}`;
        var stats = player.playerStats.stats;
        const { kicks, handballs, marks, hitouts, tackles, freesFor, freesAgainst, goals, behinds } = stats || {};
        var points =
            goals * 6 +
            tackles * 4 +
            (kicks + marks) * 3 +
            handballs * 2 +
            hitouts +
            behinds +
            freesFor -
            freesAgainst * 3;
        playerStats[jumperNumber] = { ...stats, points, name };
    });
    return playerStats;
}

function removeElementsByClass(className) {
    const elements = document.getElementsByClassName(className);
    while (elements.length > 0) {
        elements[0].parentNode.removeChild(elements[0]);
    }
}
function sortTeam(playerStats) {
    Object.keys(playerStats).sort((a, b) => playerStats[a].points - playerStats[b].points);
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
            td.append(stats[playerNumber].points);
            row.append(td);
        });
    });
}

const columns = [
    'player',
    'disposals',
    'kicks',
    'handballs',
    'marks',
    'hitouts',
    'tackles',
    'freesFor',
    'freesAgainst',
    'goals-behinds',
    'points',
];
const headingMap = {
    player: 'Player',
    disposals: 'D',
    kicks: 'K',
    handballs: 'HB',
    marks: 'M',
    hitouts: 'HO',
    tackles: 'T',
    freesFor: 'FF',
    freesAgainst: 'FA',
    'goals-behinds': 'G.B',
    points: 'PTS',
};

function displayFantasyTables(homeTeamStats, awayTeamStats) {
    const homeList = sortTeam(homeTeamStats);
    const awayList = sortTeam(awayTeamStats);
    removeElementsByClass('mc-player-stats__cell');
    removeElementsByClass('player-key-stats__header-label');
    var tables = Array.from(document.getElementsByClassName('mc-player-stats__table'));
    tables.forEach((table, index) => {
        var header = table.children[0].children[0];
        var body = table.children[0].children[1];

        columns.forEach((column) => {
            var th = document.createElement('th');
            th.classList.add('mc-player-stats__header-cell');
            if (column == 'points') {
                th.style.backgroundColor = 'rgba(255, 94, 69, 0.3)';
            }
            var thspan = document.createElement('span');
            thspan.className = 'player-key-stats__header-label';
            thspan.append(headingMap[column]);
            th.append(thspan);
            header.append(th);

            var stats = index == 0 ? homeTeamStats : awayTeamStats;
            var list = index == 0 ? homeList : awayList;
            list.forEach((player, rowIndex) => {
                var td = document.createElement('td');
                td.classList.add('mc-player-stats__cell');
                if (column == 'points') {
                    td.style.backgroundColor = `rgba(255, 94, 69, ${rowIndex % 2 ? '0.1' : '0.05'})`;
                }

                const { name, goals, behinds } = stats[playerNumber] || {};
                if (column == 'player') {
                    td.append(`${player} - ${name}`);
                } else if (column == 'goals-behinds') {
                    td.append(`${goals}.${behinds}`);
                } else {
                    td.append(stats[playerNumber][column]);
                }
                row.append(td);
            });
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
