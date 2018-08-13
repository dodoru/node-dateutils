const moment = require('moment');

const self = module.exports = {
    _depends: {
        moment: moment,
    },

    k_period: {
        date: 'day',
        day: 'day',
        week: 'week',
        month: 'month',
        year: 'year',
        history: 'history',
    },

    formPeriod: (query) => {
        // 解析接口的 query 有两种方案
        // A: {period, key} = query;
        // B：{date, week, month, year} = query;
        const {period, key} = query;
        if (period && key) {
            const query = self.k_parse[period](key);
            return {period, query, key}
        } else {
            return self.queryPeriod(query);
        }
    },

    k_fmt: {
        // query: <dict> format query to period key <string:key>
        // 所有函数的 query 参数都要严格按照对应 key 的参数
        // date: 'yyyy-mm-dd'
        day: (query) => `${query.date}`,
        week: (query) => {
            // 统一使用格式 'GGGG-[W]WW', 注意星期一是一周的第一天;
            // 注意 moment('{GGGG-[W]WW]', "GGGG-[W]WW").day(1).isSame(moment('{GGGG-[W]WW]', "GGGG-[W]WW"))
            if (query.Date) {
                return moment(query.Date).format('GGGG-[W]WW');
            } else {
                return `${query.year}-W${String(query.week).trim().padStart(2, "0")}`;
            }
        },
        month: (query) => `${query.year}-${String(query.month).trim().padStart(2, "0")}`,
        year: (query) => String(query.year).trim(),
        history: () => 'history',
    },

    k_parse: {
        // key: <string> parse period_key to <dict:query>
        day: (key) => {
            let {date} = self.queryDate(key);
            return {date}
        },
        week: (key) => {
            let [year, week] = key.split('-W').map(m => parseInt(m));
            return {year, week}
        },
        month: (key) => {
            let [year, month] = key.split('-').map(m => parseInt(m));
            return {year, month}
        },
        year: (key) => {
            return {year: parseInt(key)}
        },
        history: () => {
            return {}
        },
    },

    queryPeriod: function (form) {
        // return queryObject: {date, month, year, week}
        let int_args = [self.k_period.week, self.k_period.month, self.k_period.year];
        let ints = new Set(int_args);
        let query = {};
        let period = self.parse_period(query);
        for (let attr in form) {
            let v = form[attr];
            if (attr === "date") {
                let dt = self.queryDate(v);
                query[attr] = dt.date;
            } else {
                if (ints.has(attr)) {
                    query[attr] = parseInt(v);
                }
            }
        }
        let key = self.k_fmt[period](query);
        return {query, period, key}
    },

    queryDate: (...argsOfDate) => {
        const dt = new Date(...argsOfDate);
        const year = dt.getFullYear();
        const month = dt.getMonth() + 1;
        const day = dt.getDate();
        const week = parseInt(moment(dt.getTime()).format('W'));
        // date: 'yyyy-mm-dd'
        const date = `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
        return {year, month, day, week, date, Date: dt}
    },

    parse_period: function (query) {
        let {date, month, year, week} = query;
        let period;
        if (date) {
            period = self.k_period.day;
        } else {
            if (month && year) {
                period = self.k_period.month;
            } else {
                if (week && year) {
                    period = self.k_period.week;
                } else {
                    if (year) {
                        period = self.k_period.year;
                    } else {
                        period = self.k_period.history;
                    }
                }
            }
        }
        return period
    },

    lastPeriod: {
        day: (query, days = 1) => {
            const ts = new Date(query.date).getTime();
            const td = 1000 * 60 * 60 * 24 * days;
            const {date} = self.queryDate(ts - td);
            return {date}
        },
        week: (query) => {
            const yw = self.k_fmt.week(query);
            // 上周一, -6: 上周的第一天
            const d0 = moment(yw, "GGGG-[W]WW").day(-6);
            const year = d0.format('GGGG');
            const week = d0.format('W');
            return {year, week}
        },
        month: (query) => {
            let year, month;
            if (query.month === 1) {
                month = 12;
                year = query.year - 1;
            } else {
                month = query.month - 1;
                year = query.year;
            }
            return {year, month}
        },
        year: (query) => {
            let year = query.year - 1;
            return {year};
        },
    },

    lastPeriodString: (period, string) => {
        const q = self.k_parse[period](string);
        const pq = self.lastPeriod[period](q);
        return self.k_fmt[period](pq);
    },

    nextPeriod: {
        day: (query) => {
            const ts = new Date(query.date).getTime();
            const td = 1000 * 60 * 60 * 24;
            const {date} = self.queryDate(ts + td);
            return {date}
        },
    },

    nextDay: (date) => self.nextPeriod.day({date}).date,
    lastDay: (date, days = 1) => self.lastPeriod.day({date}, days).date,
    lastWeek: (year, week) => self.lastPeriod.week({year, week}),
    lastMonth: (year, month) => self.lastPeriod.month({year, month}),
    lastYear: (year) => year - 1,

    lastDayString: (dt) => self.lastPeriodString(self.k_period.day, dt),
    lastWeekString: (dt) => self.lastPeriodString(self.k_period.week, dt),
    lastMonthString: (dt) => self.lastPeriodString(self.k_period.month, dt),

    periodScope: {
        day: (key) => {
            // start = moment(key, "YYYY-MM-DD").startOf('day');
            const start = moment(key, "YYYY-MM-DD");
            const end = moment(key, "YYYY-MM-DD").endOf('day');
            return {start, end};
        },
        week: (key) => {
            // 这周一 , 等同于 moment(key, "GGGG-[W]WW");
            const start = moment(key, "GGGG-[W]WW").day(1);
            // 这周日, endOf('week') 返回的是周六，不符合业务需求
            const end = moment(key, "GGGG-[W]WW").day(7).endOf('day');
            return {start, end};
        },
        month: (key) => {
            const start = moment(key, "YYYY-MM").local();
            const end = moment(key, "YYYY-MM").endOf('month');
            return {start, end};
        },
        year: (key) => {
            const start = moment(key, "YYYY").local();
            const end = moment(key, "YYYY").endOf('year');
            return {start, end};
        },
    },

    periodScopeTs: (period, key) => {
        const func = self.periodScope[period];
        if (func) {
            const {start, end} = func(key);
            const start_ts = start.valueOf();
            const end_ts = end.valueOf();
            return {start_ts, end_ts};
        }
    },

    periodScopeDate: (period, key) => {
        const func = self.periodScope[period];
        if (func) {
            const {start, end} = func(key);
            const start_date = start.format('YYYY-MM-DD');
            const end_date = end.format('YYYY-MM-DD');
            return {start_date, end_date};
        }
    },

    periodDates: (period, key) => {
        const func = self.periodScope[period];
        if (func) {
            const {start, end} = func(key);
            const t0 = start.valueOf();
            const t1 = end.valueOf();
            const ary = self.breakTimePoints(t0, t1);
            const ds = ary.map(ts => moment(ts).format('YYYY-MM-DD'));
            return ds;
        }
    },

    scope180d: (expired_date) => {
        const ts = new Date(expired_date).getTime();
        const end_date = self.lastDay(expired_date);
        const start_ts = ts - 180 * 1000 * 60 * 60 * 24;
        const start_date = self.queryDate(start_ts).date;
        return {ts, start_date, end_date}
    },

    rangeDates: (start_date, end_date) => {
        const start = moment(start_date, 'YYYY-MM-DD').valueOf();
        const end = moment(end_date, 'YYYY-MM-DD').valueOf();
        const ary = self.breakTimePoints(start, end);
        const ds = ary.map(ts => moment(ts).format('YYYY-MM-DD'));
        return ds;
    },

    breakTimePoints: (start_ts, end_ts, step = 24 * 60 * 60 * 1000) => {
        // step: milliseconds , the default is 1 day
        const ary = [];
        for (let ts = start_ts; ts <= end_ts; ts += step) {
            ary.push(ts);
        }
        return ary;
    },

    timeOffset: (ts, offset = 0, round = 1000) => {
        return ts - ts % round + offset;
    },

    lastHour: (ts) => {
        // 整点
        const date = new Date(ts);
        const hour = date.getHours();
        const secs = date.getSeconds();
        if (secs === 0) {
            return (hour - 1 + 24) % 24
        } else {
            return hour;
        }
    },
};
