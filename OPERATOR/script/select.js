new Vue({
    el: '#app',
    data() {
        return {
            currentRanking: 'overall',
            rogueSubRanking: 'all',
            operators: [],
            expandedLevels: {}, // 存储每个等级的展开状态
            cupLevels: [
                '超大杯顶', '超大杯上', '超大杯中', '超大杯下',
                '大杯上', '大杯中', '大杯下',
                '中杯', '小杯'
            ]
        }
    },
    computed: {
        sortedOperators() {
            const rankingType = this.currentRanking === 'rogue' ? this.rogueSubRanking : this.currentRanking;
            const operatorsWithScores = this.operators.map(op => {
                let score = 0;

                switch (rankingType) {
                    case 'overall':
                        score = this.calculateOverallScore(op);
                        break;
                    case 'daily':
                        score = this.calculateDailyScore(op);
                        break;
                    case 'counter':
                        score = this.calculateCounterScore(op);
                        break;
                    case 'contract':
                        score = this.calculateContractScore(op);
                        break;
                    case 'all':
                        score = this.calculateRogueScore(op);
                        break;
                    default:
                        score = op.scores.rogue[rankingType] || 0;
                }

                return {
                    name: op.name,
                    score: score
                };
            }).filter(op => op.score > 0);

            // Group by cup level
            const grouped = {};
            this.cupLevels.forEach(level => {
                grouped[level] = [];
            });

            operatorsWithScores
                .sort((a, b) => b.score - a.score)
                .forEach(op => {
                    const level = this.getCupLevel(op.score);
                    grouped[level].push(op);
                });

            // Remove empty levels
            Object.keys(grouped).forEach(level => {
                if (grouped[level].length === 0) {
                    delete grouped[level];
                } else {
                    // 初始化展开状态
                    if (this.expandedLevels[level] === undefined) {
                        this.$set(this.expandedLevels, level, false);
                    }
                }
            });

            return grouped;
        }
    },
    created() {
        this.loadOperators();
    },
    methods: {
        loadOperators() {
            this.operators = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith('operator_')) {
                    const name = key.replace('operator_', '');
                    const data = JSON.parse(localStorage.getItem(key));
                    this.operators.push({
                        name: name,
                        scores: data.scores,
                        reasons: data.reasons
                    });
                }
            }
        },
        calculateOverallScore(operator) {
            const dailyScore = this.calculateDailyScore(operator);
            const counterScore = this.calculateCounterScore(operator);
            const rogueScore = this.calculateRogueScore(operator);
            const contractScore = this.calculateContractScore(operator);

            return (dailyScore * 7 + counterScore * 3 + rogueScore * 10 + contractScore * 5) / (7 + 3 + 10 + 5);
        },
        calculateDailyScore(operator) {
            const { talent, skill, attack, other } = operator.scores.daily;
            return (talent * 5 + skill * 15 + attack * 3 + other * 3) / (5 + 15 + 3 + 3);
        },
        calculateCounterScore(operator) {
            const { irreplaceable, ideal, afk } = operator.scores.counter;
            return (irreplaceable * 3 + ideal * 2 + afk * 1) / (3 + 2 + 1);
        },
        calculateRogueScore(operator) {
            const { e1, phantom, mizuki, sami, sarkaz, boundary } = operator.scores.rogue;
            return (e1 + phantom + mizuki + sami + sarkaz + boundary) / 6;
        },
        calculateContractScore(operator) {
            const { survival, damage, team } = operator.scores.contract;
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
        },
        getCupClass(level) {
            return level.replace(' ', '-').toLowerCase();
        },
        changeRanking(type) {
            this.currentRanking = type;
            if (type !== 'rogue') {
                this.rogueSubRanking = 'all';
            }
            // 切换榜单时关闭所有展开
            Object.keys(this.expandedLevels).forEach(level => {
                this.expandedLevels[level] = false;
            });
        },
        changeRogueRanking() {
            this.currentRanking = 'rogue';
            this.rogueSubRanking = 'all';
            // 切换榜单时关闭所有展开
            Object.keys(this.expandedLevels).forEach(level => {
                this.expandedLevels[level] = false;
            });
        },
        changeRogueSubRanking(type) {
            this.rogueSubRanking = type;
            // 切换子榜单时关闭所有展开
            Object.keys(this.expandedLevels).forEach(level => {
                this.expandedLevels[level] = false;
            });
        },
        toggleLevel(level) {
            this.$set(this.expandedLevels, level, !this.expandedLevels[level]);
        },
        getOperatorImage(name) {
            return `../overall_image/operators/${name}.png`;
        },
        handleImageError(event) {
            event.target.src = '../overall_image/operators/乌有.png';
        },
        goToDetail(name) {
            window.location.href = `./detail.html?name=${encodeURIComponent(name)}`;
        }
    }
});