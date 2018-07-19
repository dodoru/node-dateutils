const assert = require('assert');
const moment = require('moment');
const dateutils = require('./index');

const test_parse_day = () => {
    console.log('\n[test_parse_day]');

    let m = '2018-05-11';
    let m1 = '2018/05/11';
    let m2 = '2018/5/11';
    let m3 = '2018/05/11';
    let m4 = '05/11/2018';


    let d = dateutils.k_parse.day(m);
    let d1 = dateutils.k_parse.day(m1);
    let d2 = dateutils.k_parse.day(m2);
    let d3 = dateutils.k_parse.day(m3);
    let d4 = dateutils.k_parse.day(m4);


    console.log(m, d);
    console.log(m1, d1);
    console.log(m2, d2);
    console.log(m3, d3);
    console.log(m4, d4);

    // 均返回 {date: '2018-05-11'}
    let q = {date: '2018-05-11'};
    assert.deepEqual(d, q);
    assert.deepEqual(d, d1);
    assert.deepEqual(d, d2);
    assert.deepEqual(d, d3);
    assert.deepEqual(d, d4);
};

const test_last_date_string = () => {
    console.log('\n[test_last_date_string]');

    let m = '2018-05-11';
    let m1 = '2018/05/11';
    let m2 = '2018/5/11';
    let m3 = '2018/05/11';
    let m4 = '05/11/2018';

    let t  = dateutils.lastDay(m);
    let t1 = dateutils.lastDay(m1);
    let t2 = dateutils.lastDay(m2);
    let t3 = dateutils.lastDay(m3);
    let t4 = dateutils.lastDay(m4);

    console.log(m,  t);
    console.log(m1, t1);
    console.log(m2, t2);
    console.log(m3, t3);
    console.log(m4, t4);

    let d = dateutils.lastDayString(m);
    let d1 = dateutils.lastDayString(m1);
    let d2 = dateutils.lastDayString(m2);
    let d3 = dateutils.lastDayString(m3);
    let d4 = dateutils.lastDayString(m4);

    console.log(m,  d);
    console.log(m1, d1);
    console.log(m2, d2);
    console.log(m3, d3);
    console.log(m4, d4);

    // 均返回 '2018-05-10'
    let q = '2018-05-10';
    assert.deepEqual(d, q);
    assert.deepEqual(d, d1);
    assert.deepEqual(d, d2);
    assert.deepEqual(d, d3);
    assert.deepEqual(d, d4);
};

const test_last_week_string = () => {
    // 其余测试
    let w1 = '2018-W18';
    let wk0 = dateutils.lastWeekString(w1);
    console.log(w1, wk0);
    assert.deepEqual(wk0, '2018-W17');

    let w2 = '2018-W1';
    let wk2 = dateutils.lastWeekString(w2);

    console.log(w2, wk2);
    assert.deepEqual(wk2, '2017-W52');

    let w3 = '2018-W01';
    let wk3 = dateutils.lastWeekString(w2);

    console.log(w3, wk3);
    assert.deepEqual(wk3, '2017-W52');

};


const test_week_of_date = () => {
    console.log('\ntest_query_date\n');
    let y1 = 2012;
    let y2 = 2022;
    for (let y = y1; y <= y2; y++) {
        let m1 = `${y}-01-01`;
        let m2 = `${y}-12-31`;
        let d1 = dateutils.queryDate(m1);
        let d2 = dateutils.queryDate(m2);
        let w1 = moment(m1).format('gggg-\\Www');
        let w2 = moment(m1).format('gggg-\\Ww');

        let wb1 = moment(m2).format('gggg-\\Ww');
        let wb2 = moment(m2).format('gggg-\\Www');


        console.log(m1, dateutils.k_fmt.week(d1), w1, w2);
        console.log(m2, dateutils.k_fmt.week(d2), wb1, wb2);
        console.log('year', y, '\n')
    }
};

const test_period_dates = () => {
    let w1 = '2018-W01';
    let wd1 = dateutils.periodDates('week', w1);
    console.log('week dates', w1, wd1);

    let m1 = '2018-02';
    let m2 = '2017-02';
    let m3 = '2017-12';
    let m4 = '2018-01';
    let m5 = '2016-02';
    let m6 = '2018-11';

    let md1 = dateutils.periodDates('month', m1);
    let md2 = dateutils.periodDates('month', m2);
    let md3 = dateutils.periodDates('month', m3);
    let md4 = dateutils.periodDates('month', m4);
    let md5 = dateutils.periodDates('month', m5);
    let md6 = dateutils.periodDates('month', m6);

    console.log('month dates', m1, md1, md1.length);
    console.log('month dates', m2, md2, md2.length);
    console.log('month dates', m3, md3, md3.length);
    console.log('month dates', m4, md4, md4.length);
    console.log('month dates', m5, md5, md5.length);
    console.log('month dates', m6, md6, md6.length);

    assert.equal(md1.length, 28);
    assert.equal(md2.length, 28);
    assert.equal(md3.length, 31);
    assert.equal(md4.length, 31);
    assert.equal(md5.length, 29);
    assert.equal(md6.length, 30);


    // year
    let y1 = '2018';
    let y2 = '2017';
    let y3 = '2016';
    let yd1 = dateutils.periodDates('year', y1);
    let yd2 = dateutils.periodDates('year', y2);
    let yd3 = dateutils.periodDates('year', y3);
    console.log('year dates', y1, yd1.length, yd1[0], yd1[yd1.length - 1]);
    console.log('year dates', y2, yd2.length, yd1[0], yd1[yd1.length - 1]);
    console.log('year dates', y3, yd3.length, yd1[0], yd1[yd1.length - 1])

    assert.equal(yd1.length, 365);
    assert.equal(yd2.length, 365);
    assert.equal(yd3.length, 366);
};


const test_range_dates = () => {
    let w1 = '2018-W01';
    let w2 = '2018-W52';
    let w3 = '2018-W53';
    let wd1 = dateutils.periodScopeDate('week', w1);
    let wd2 = dateutils.periodScopeDate('week', w2);
    let wd3 = dateutils.periodScopeDate('week', w3);
    console.log('week dates', w1, wd1);
    console.log('week dates', w2, wd2);
    console.log('week dates', w3, wd3);
    assert.equal(wd3.end_date, 'Invalid date');
    assert.equal(wd3.start_date, 'Invalid date');


    let m1 = '2018-02';
    let m2 = '2017-02';
    let m3 = '2017-12';
    let m4 = '2018-01';
    let m5 = '2016-02';
    let m6 = '2018-11';

    let md1 = dateutils.periodScopeDate('month', m1);
    let md2 = dateutils.periodScopeDate('month', m2);
    let md3 = dateutils.periodScopeDate('month', m3);
    let md4 = dateutils.periodScopeDate('month', m4);
    let md5 = dateutils.periodScopeDate('month', m5);
    let md6 = dateutils.periodScopeDate('month', m6);

    console.log('month dates', m1, md1);
    console.log('month dates', m2, md2);
    console.log('month dates', m3, md3);
    console.log('month dates', m4, md4);
    console.log('month dates', m5, md5);
    console.log('month dates', m6, md6);


    // year
    let y1 = '2018';
    let y2 = '2017';
    let y3 = '2016';
    let yd1 = dateutils.periodScopeDate('year', y1);
    let yd2 = dateutils.periodScopeDate('year', y2);
    let yd3 = dateutils.periodScopeDate('year', y3);
    console.log('year dates', y1, yd1);
    console.log('year dates', y2, yd2);
    console.log('year dates', y3, yd3)

};

const test = () => {
    test_parse_day();
    test_last_date_string();
    test_last_week_string();
    test_week_of_date();

    test_range_dates();
    test_period_dates();

    const today = new Date(dateutils.queryDate().date);
    console.log('\ntoday', today, dateutils.queryDate().Date);
};

test();