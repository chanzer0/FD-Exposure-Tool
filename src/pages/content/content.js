

const makeRoomForExposureViewAndReturnElement = () => {
    // get div with id='root'
    const root = document.getElementById('root');
    // select its first child
    const firstChild = root.children[0];
    // selec that elements second child
    const secondChild = firstChild.children[1];
    // grab that elements second child
    const thirdChild = secondChild.children[1];
    // add margin 1 rem, and width 100% to that element
    thirdChild.style.margin = '1rem';
    thirdChild.style.width = '100%';
    // grab that elements first child
    const fourthChild = thirdChild.children[0];
    // add display grid, grid template columns and width 100%
    fourthChild.style.display = 'grid';
    fourthChild.style.gridTemplateColumns = 'minmax(0px, 224px) minmax(0px, 3fr) minmax(0px, 1fr)';
    fourthChild.style.gap = '4rem';
    fourthChild.style.width = '100%';

    const parentElement = fourthChild.parentElement;

    // Remove the maxWidth style from the parent element
    parentElement.style.maxWidth = 'none';

    return fourthChild;
};

const getExposures = () => {
    let playerExposures = {};
    const teamExposures = {};

    // get count of divs where data-test-id="lineup-player-container"
    const lineups = document.querySelectorAll('[data-test-id="lineup-player-container"]');
    const numLineups = lineups.length;
    if (numLineups === 0) {
        return { playerExposures, teamExposures, numLineups };
    }

    // get all elements where data-test-id="lineup-player-name"
    const playerNameElements = document.querySelectorAll('[data-test-id="lineup-player-name"]');
    playerNameElements.forEach((playerEl, index) => {
        // get the player name - its the text content of this element
        const playerName = playerEl.textContent;

        // add the player name to the playerExposures object with a value of 1 if it doesn't already exist, otherwise increment the value by 1
        playerExposures[playerName] = playerExposures[playerName] ? playerExposures[playerName] + 1 : 1;
    });

    // sort the playerExposures object by count
    playerExposures = Object.entries(playerExposures).sort(([, countA], [, countB]) => {
        return countB - countA;
    }).reduce((acc, [player, count]) => {
        acc[player] = count;
        return acc;
    }, {});


    // Iterate each lineup element, and count the occurences of each primary-team, and save as a stack string (e.g. "STL 4, PIT 3")
    lineups.forEach((lineup, index) => {
        // get all the elements where data-test-id="primary-team"
        const teamElements = lineup.querySelectorAll('[data-test-id="primary-team"]');

        // group by team name, and count the occurences
        const teamCount = {};
        teamElements.forEach((teamEl, index) => {
            // skip the first element, as it is the pitcher
            if (index === 0) {
                return;
            }
            // get the team name - its the text content of this element
            const teamName = teamEl.textContent;

            // add the team name to the teamExposures object with a value of 1 if it doesn't already exist, otherwise increment the value by 1
            teamCount[teamName] = teamCount[teamName] ? teamCount[teamName] + 1 : 1;
        });
        // convert the object to a string, and add it to the teamExposures object
        const teamStackString = Object.entries(teamCount).filter(([team, count]) => count > 1).sort(([, countA], [, countB]) => {
            return countB - countA;
        }).map(([team, count]) => `${team} ${count}`).join(', ');
        teamExposures[teamStackString] = teamExposures[teamStackString] ? teamExposures[teamStackString] + 1 : 1;
    });

    return { playerExposures, teamExposures, numLineups };
}

const constructExposureView = (topLevelElement, playerExposures, teamExposures, numLineups) => {
    const exposureViewContainer = document.createElement('div');
    exposureViewContainer.style.padding = '0 1rem';
    exposureViewContainer.style.backgroundColor = '#ffffff';
    exposureViewContainer.style.borderRadius = '10px';
    exposureViewContainer.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';

    const createCollapsibleSection = (title, table) => {
        const section = document.createElement('div');
        section.style.marginBottom = '2rem';

        const sectionHeader = document.createElement('div');
        sectionHeader.textContent = title;
        sectionHeader.style.cursor = 'pointer';
        sectionHeader.style.fontWeight = 'bold';
        sectionHeader.style.marginTop = '1rem';
        sectionHeader.style.textAlign = 'center';
        sectionHeader.addEventListener('click', () => {
            table.style.display = table.style.display === 'none' ? 'table' : 'none';
        });

        section.appendChild(sectionHeader);
        section.appendChild(table);

        return section;
    };

    const playerExposureTable = document.createElement('table');
    playerExposureTable.style.width = '100%';
    playerExposureTable.style.borderCollapse = 'separate';
    playerExposureTable.style.borderSpacing = '0 10px';
    playerExposureTable.style.marginBottom = '2rem';

    const playerExposureHeader = playerExposureTable.createTHead();
    const playerExposureHeaderRow = playerExposureHeader.insertRow();
    const playerHeaderCells = ['Player', 'Count', 'Percentage'];
    playerHeaderCells.forEach((headerText, index) => {
        const th = document.createElement('th');
        th.textContent = headerText;
        th.style.padding = '12px';
        th.style.backgroundColor = '#0d7fe1';
        th.style.textAlign = 'left';
        th.style.fontWeight = 'bold';
        th.style.color = '#ffffff';

        if (index === 0) {
            th.style.borderTopLeftRadius = '5px';
            th.style.borderBottomLeftRadius = '5px';
        } else if (index === playerHeaderCells.length - 1) {
            th.style.borderTopRightRadius = '5px';
            th.style.borderBottomRightRadius = '5px';
        }

        playerExposureHeaderRow.appendChild(th);
    });

    const playerExposureBody = playerExposureTable.createTBody();
    Object.entries(playerExposures).forEach(([player, count]) => {
        const percentage = ((count / numLineups) * 100).toFixed(2);
        const row = playerExposureBody.insertRow();
        row.style.backgroundColor = '#ffffff';
        row.style.borderRadius = '5px';
        row.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
        const playerCell = row.insertCell();
        playerCell.textContent = player;
        playerCell.style.padding = '12px';
        const countCell = row.insertCell();
        countCell.textContent = count;
        countCell.style.padding = '12px';
        const percentageCell = row.insertCell();
        percentageCell.textContent = `${percentage}%`;
        percentageCell.style.padding = '12px';
        percentageCell.style.fontWeight = 'bold';
    });

    const teamExposureTable = document.createElement('table');
    teamExposureTable.style.width = '100%';
    teamExposureTable.style.borderCollapse = 'separate';
    teamExposureTable.style.borderSpacing = '0 10px';

    const teamExposureHeader = teamExposureTable.createTHead();
    const teamExposureHeaderRow = teamExposureHeader.insertRow();
    const teamHeaderCells = ['Stack', 'Count', 'Percentage'];
    teamHeaderCells.forEach((headerText, index) => {
        const th = document.createElement('th');
        th.textContent = headerText;
        th.style.padding = '12px';
        th.style.backgroundColor = '#0d7fe1';
        th.style.textAlign = 'left';
        th.style.fontWeight = 'bold';
        th.style.color = '#ffffff';

        if (index === 0) {
            th.style.borderTopLeftRadius = '5px';
            th.style.borderBottomLeftRadius = '5px';
        } else if (index === teamHeaderCells.length - 1) {
            th.style.borderTopRightRadius = '5px';
            th.style.borderBottomRightRadius = '5px';
        }

        teamExposureHeaderRow.appendChild(th);
    });

    const teamExposureBody = teamExposureTable.createTBody();
    Object.entries(teamExposures).forEach(([team, count]) => {
        const percentage = ((count / numLineups) * 100).toFixed(2);
        const row = teamExposureBody.insertRow();
        row.style.backgroundColor = '#ffffff';
        row.style.borderRadius = '5px';
        row.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
        const teamCell = row.insertCell();
        teamCell.textContent = team;
        teamCell.style.padding = '12px';
        const countCell = row.insertCell();
        countCell.textContent = count;
        countCell.style.padding = '12px';
        const percentageCell = row.insertCell();
        percentageCell.textContent = `${percentage}%`;
        percentageCell.style.padding = '12px';
        percentageCell.style.fontWeight = 'bold';
    });

    const playerExposureSection = createCollapsibleSection('Player Exposures (Expand/Collapse)', playerExposureTable);
    exposureViewContainer.appendChild(playerExposureSection);

    const teamExposureSection = createCollapsibleSection('Team Exposures (Expand/Collapse)', teamExposureTable);
    exposureViewContainer.appendChild(teamExposureSection);

    topLevelElement.appendChild(exposureViewContainer);
};



// Main
const main = () => {
    console.log('Content script loaded');
    let { playerExposures, teamExposures, numLineups } = getExposures();
    if (numLineups > 0) {
        let topLevelElement = makeRoomForExposureViewAndReturnElement();
        constructExposureView(topLevelElement, playerExposures, teamExposures, numLineups);
    }
    else {
        console.log('No lineups found');
    }
}
window.addEventListener('load', () => {
    main();
});