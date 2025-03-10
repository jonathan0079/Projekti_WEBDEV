document.getElementById('laske-bmi').addEventListener('click', function() {
    const weight = parseFloat(document.getElementById('paino').value);
    const height = parseFloat(document.getElementById('pituus').value) / 100;

    if (weight > 0 && height > 0) {
        const bmi = (weight / (height * height)).toFixed(1);
        document.getElementById('bmi-arvo').textContent = bmi;

        let analysis = "";
        document.querySelectorAll('.highlight-normaali, .highlight-ylipaino, .highlight-alipaino').forEach(el => {
            el.classList.remove('highlight-normaali', 'highlight-ylipaino', 'highlight-alipaino');
        });

        if (bmi < 18.5) {
            analysis = "Alipaino. SYÖ ENEMMÄN.";
            document.querySelector('.alipaino td').classList.add('highlight-alipaino');
        } else if (bmi >= 18.5 && bmi <= 24.9) {
            analysis = "Normaali paino. MENE TÖIHIN.";
            document.querySelector('.normaali td').classList.add('highlight-normaali');
        } else {
            analysis = "Ylipaino. SYÖ VÄHEMMÄN.";
            document.querySelector('.ylipaino td').classList.add('highlight-ylipaino');
        }

        document.getElementById('bmi-analyysi').textContent = `Analyysi: ${analysis}`;
    } else {
        alert('Syötä kelvolliset arvot!');
    }
});
