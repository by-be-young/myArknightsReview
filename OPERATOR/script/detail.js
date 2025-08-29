new Vue({
    el: '#app',
    data() {
        return {
            operatorName: '',
            currentTab: 'daily',
            weights: {
                daily: 7,
                counter: 3,
                rogue: 10,
                contract: 5
            },
            showReasons: {
                daily: {
                    talent: false,
                    skill: false,
                    attack: false,
                    other: false
                },
                counter: {
                    irreplaceable: false,
                    ideal: false,
                    afk: false
                },
                rogue: {
                    e1: false,
                    phantom: false,
                    mizuki: false,
                    sami: false,
                    sarkaz: false,
                    boundary: false
                },
                contract: {
                    survival: false,
                    damage: false,
                    team: false,
                    record: false
                }
            },
            scores: {
                daily: {
                    talent: 40,
                    skill: 40,
                    attack: 40,
                    other: 40
                },
                counter: {
                    irreplaceable: 40,
                    ideal: 40,
                    afk: 40
                },
                rogue: {
                    e1: 40,
                    phantom: 40,
                    mizuki: 40,
                    sami: 40,
                    sarkaz: 40,
                    boundary: 40
                },
                contract: {
                    survival: 40,
                    damage: 40,
                    team: 40
                }
            },
            reasons: {
                daily: {
                    talent: '',
                    skill: '',
                    attack: '',
                    other: ''
                },
                counter: {
                    irreplaceable: '',
                    ideal: '',
                    afk: ''
                },
                rogue: {
                    e1: '',
                    phantom: '',
                    mizuki: '',
                    sami: '',
                    sarkaz: '',
                    boundary: ''
                },
                contract: {
                    survival: '',
                    damage: '',
                    team: '',
                    record: ''
                }
            }
        }
    },
    computed: {
        dailyScore() {
            const { talent, skill, attack, other } = this.scores.daily;
            return (talent * 5 + skill * 15 + attack * 3 + other * 3) / (5 + 15 + 3 + 3);
        },
        counterScore() {
            const { irreplaceable, ideal, afk } = this.scores.counter;
            return (irreplaceable * 3 + ideal * 2 + afk * 1) / (3 + 2 + 1);
        },
        rogueScore() {
            const { e1, phantom, mizuki, sami, sarkaz, boundary } = this.scores.rogue;
            return (e1 + phantom + mizuki + sami + sarkaz + boundary) / 6;
        },
        contractScore() {
            const { survival, damage, team } = this.scores.contract;
            const scores = [survival, damage, team];
            const maxScore = Math.max(...scores);
            const minScore = Math.min(...scores);
            const maxIndex = scores.indexOf(maxScore);
            const minIndex = scores.indexOf(minScore);

            // 权重数组：默认全部 5
            const weights = [5, 5, 5];
            // 最高分权重设为 20，最低分设为 1
            weights[maxIndex] = 20;
            weights[minIndex] = 1;

            const total = survival * weights[0] +
                damage * weights[1] +
                team * weights[2];

            return total / (weights[0] + weights[1] + weights[2]);
        },
        overallScore() {
            return (this.dailyScore * this.weights.daily +
                this.counterScore * this.weights.counter +
                this.rogueScore * this.weights.rogue +
                this.contractScore * this.weights.contract) /
                (this.weights.daily + this.weights.counter + this.weights.rogue + this.weights.contract);
        }
    },
    created() {
        this.loadOperatorData();
    },
    methods: {
        loadOperatorData() {
            // 从URL参数获取干员名称
            const urlParams = new URLSearchParams(window.location.search);
            const name = urlParams.get('name');

            if (name) {
                this.operatorName = name;
                // 从本地存储加载数据
                const savedData = localStorage.getItem(`operator_${name}`);
                if (savedData) {
                    const data = JSON.parse(savedData);
                    this.scores = data.scores || this.scores;
                    this.reasons = data.reasons || this.reasons;
                    this.weights = data.weights || this.weights;
                }
            }
        },
        saveData() {
            if (this.operatorName) {
                const data = {
                    scores: this.scores,
                    reasons: this.reasons,
                    weights: this.weights
                };
                localStorage.setItem(`operator_${this.operatorName}`, JSON.stringify(data));
            }
        },
        updateScores() {
            // 确保分数在40-100之间
            for (const category in this.scores) {
                for (const key in this.scores[category]) {
                    if (this.scores[category][key] < 40) this.scores[category][key] = 40;
                    if (this.scores[category][key] > 100) this.scores[category][key] = 100;
                }
            }
            this.saveData();
        },
        updateWeights() {
            // 确保权重在合理范围内
            for (const key in this.weights) {
                if (this.weights[key] < 1) this.weights[key] = 1;
                if (this.weights[key] > 20) this.weights[key] = 20;
            }
            this.saveData();
        },
        toggleReason(category, item) {
            this.$set(this.showReasons[category], item, !this.showReasons[category][item]);
        },
        createOperator() {
            const name = prompt('请输入干员名称:');
            if (name) {
                this.operatorName = name;
                // 重置数据
                this.scores = {
                    daily: {
                        talent: 40,
                        skill: 40,
                        attack: 40,
                        other: 40
                    },
                    counter: {
                        irreplaceable: 40,
                        ideal: 40,
                        afk: 40
                    },
                    rogue: {
                        e1: 40,
                        phantom: 40,
                        mizuki: 40,
                        sami: 40,
                        sarkaz: 40,
                        boundary: 40
                    },
                    contract: {
                        survival: 40,
                        damage: 40,
                        team: 40
                    }
                };
                this.reasons = {
                    daily: {
                        talent: '',
                        skill: '',
                        attack: '',
                        other: ''
                    },
                    counter: {
                        irreplaceable: '',
                        ideal: '',
                        afk: ''
                    },
                    rogue: {
                        e1: '',
                        phantom: '',
                        mizuki: '',
                        sami: '',
                        sarkaz: '',
                        boundary: ''
                    },
                    contract: {
                        survival: '',
                        damage: '',
                        team: '',
                        record: ''
                    }
                };
                this.weights = {
                    daily: 7,
                    counter: 3,
                    rogue: 10,
                    contract: 5
                };

                // 更新URL
                const newUrl = `${window.location.pathname}?name=${encodeURIComponent(name)}`;
                window.history.pushState(null, '', newUrl);

                this.saveData();
            }
        },
        deleteOperator() {
            if (confirm(`确定要删除干员 ${this.operatorName} 的评分数据吗？`)) {
                localStorage.removeItem(`operator_${this.operatorName}`);
                this.operatorName = '';
                // 更新URL
                window.history.pushState(null, '', window.location.pathname);
            }
        },
        getScoreClass(score) {
            if (score >= 95) return 'score-95';
            if (score >= 90) return 'score-90';
            if (score >= 85) return 'score-85';
            if (score >= 80) return 'score-80';
            if (score >= 75) return 'score-75';
            if (score >= 70) return 'score-70';
            if (score >= 65) return 'score-65';
            if (score >= 60) return 'score-60';
            return 'bg-score-low';
        },
        getCupLevel(score) {
            if (score >= 95) return '超大杯顶';
            if (score >= 90) return '超大杯上';
            if (score >= 85) return '超大杯中';
            if (score >= 80) return '超大杯下';
            if (score >= 75) return '大杯上';
            if (score >= 70) return '大杯中';
            if (score >= 65) return '大杯下';
            if (score >= 60) return '中杯';
            return '小杯';
        }
    }
});