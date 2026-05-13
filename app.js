// 应用状态管理
const AppState = {
    words: [], // 单词列表
    currentStudyIndex: 0, // 当前背诵索引
    studyWords: [], // 当前背诵的单词列表
    displayMode: 'chinese', // 显示模式：chinese或english
    cet4Dictionary: null, // CET4词典数据
    wordLearningStats: {}, // 单词学习统计 {wordId: {consecutiveCorrect: 0, lastReviewTime: null, reviewCount: 0, nextReviewTime: null}}
    pendingReviewWords: [], // 待复习的单词队列（不记得的单词）
    wordsSinceLastReview: 0 // 自上次复习以来背诵的单词数量
};

// DOM元素
const elements = {
    // 导航按钮
    btnRecord: document.getElementById('btn-record'),
    btnStudy: document.getElementById('btn-study'),
    
    // 记录模块
    recordSection: document.getElementById('record-section'),
    wordInput: document.getElementById('word-input'),
    btnSearch: document.getElementById('btn-search'),
    wordResult: document.getElementById('word-result'),
    wordList: document.getElementById('word-list'),
    wordCount: document.getElementById('word-count'),
    
    // 背诵模块
    studySection: document.getElementById('study-section'),
    displayMode: document.getElementById('display-mode'),
    btnStartStudy: document.getElementById('btn-start-study'),
    studyCard: document.getElementById('study-card'),
    cardWord: document.getElementById('card-word'),
    cardMeaning: document.getElementById('card-meaning'),
    btnRemember: document.getElementById('btn-remember'),
    btnForget: document.getElementById('btn-forget'),
    confirmButtons: document.getElementById('confirm-buttons'),
    currentIndex: document.getElementById('current-index'),
    totalCount: document.getElementById('total-count'),
    progressFill: document.getElementById('progress-fill'),
    studyComplete: document.getElementById('study-complete'),
    reviewedCount: document.getElementById('reviewed-count'),
    btnRestart: document.getElementById('btn-restart')
};

// 初始化应用
async function init() {
    await loadCET4Dictionary();
    loadWords();
    setupEventListeners();
    renderWordList();
}

// 加载CET4词典数据
async function loadCET4Dictionary() {
    try {
        console.log('正在加载CET4词典...');
        const response = await fetch('CET4.json');
        
        if (!response.ok) {
            throw new Error('无法加载CET4词典文件');
        }
        
        const text = await response.text();
        // 解析JSON Lines格式（每行一个JSON对象）
        const lines = text.trim().split('\n');
        const dictionary = {};
        
        lines.forEach(line => {
            try {
                const data = JSON.parse(line);
                const word = data.headWord.toLowerCase();
                dictionary[word] = data;
            } catch (e) {
                console.error('解析单词数据失败:', e);
            }
        });
        
        AppState.cet4Dictionary = dictionary;
        console.log(`CET4词典加载完成，共 ${Object.keys(dictionary).length} 个单词`);
    } catch (error) {
        console.error('加载CET4词典失败:', error);
        AppState.cet4Dictionary = {};
    }
}

// 设置事件监听器
function setupEventListeners() {
    // 导航切换
    elements.btnRecord.addEventListener('click', () => switchTab('record'));
    elements.btnStudy.addEventListener('click', () => switchTab('study'));
    
    // 查询单词
    elements.btnSearch.addEventListener('click', searchAndAddWord);
    elements.wordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchAndAddWord();
        }
    });
    
    // 背诵控制
    elements.btnStartStudy.addEventListener('click', startStudy);
    elements.btnRemember.addEventListener('click', handleRemember);
    elements.btnForget.addEventListener('click', handleForget);
    elements.btnRestart.addEventListener('click', restartStudy);
    
    // 显示模式切换
    elements.displayMode.addEventListener('change', (e) => {
        AppState.displayMode = e.target.value;
    });
}

// 切换标签页
function switchTab(tab) {
    if (tab === 'record') {
        elements.recordSection.classList.add('active');
        elements.studySection.classList.remove('active');
        elements.btnRecord.classList.add('active');
        elements.btnStudy.classList.remove('active');
    } else {
        elements.recordSection.classList.remove('active');
        elements.studySection.classList.add('active');
        elements.btnRecord.classList.remove('active');
        elements.btnStudy.classList.add('active');
    }
}

// 从牛津词典API查询单词
async function searchOxfordDictionary(word) {
    const appId = 'YOUR_APP_ID'; // 需要注册牛津词典API获取
    const appKey = 'YOUR_APP_KEY'; // 需要注册牛津词典API获取
    
    try {
        // 使用免费的Dictionary API作为替代
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        
        if (!response.ok) {
            throw new Error('单词未找到');
        }
        
        const data = await response.json();
        const entry = data[0];
        
        // 提取单词信息
        const wordInfo = {
            word: entry.word,
            phonetic: entry.phonetic || entry.phonetics?.find(p => p.text)?.text || '',
            meanings: []
        };
        
        // 提取释义
        if (entry.meanings) {
            entry.meanings.forEach(meaning => {
                meaning.definitions.forEach(def => {
                    wordInfo.meanings.push({
                        partOfSpeech: meaning.partOfSpeech,
                        definition: def.definition,
                        example: def.example || ''
                    });
                });
            });
        }
        
        return wordInfo;
    } catch (error) {
        console.error('查询失败:', error);
        throw error;
    }
}

// 获取详细的中文释义（使用多个数据源）
async function getDetailedChineseMeaning(word) {
    try {
        // 第一优先级：从CET4本地词典获取
        if (AppState.cet4Dictionary && AppState.cet4Dictionary[word.toLowerCase()]) {
            const cet4Data = AppState.cet4Dictionary[word.toLowerCase()];
            const chineseMeanings = extractChineseFromCET4(cet4Data);
            
            if (chineseMeanings && chineseMeanings.length > 0) {
                console.log(`从CET4词典获取到 "${word}" 的释义`);
                return chineseMeanings.join('\n');
            }
        }
        
        // 第二优先级：尝试从有道词典API获取详细释义
        console.log(`CET4词典未找到 "${word}"，尝试有道词典...`);
        const response = await fetch(
            `https://dict.youdao.com/jsonapi?q=${encodeURIComponent(word)}&doctype=json`
        );
        
        if (!response.ok) {
            throw new Error('有道词典查询失败');
        }
        
        const data = await response.json();
        let chineseMeanings = [];
        
        // 提取基本翻译
        if (data.translate && data.translate.length > 0) {
            chineseMeanings.push(data.translate.join('; '));
        }
        
        // 提取详细释义
        if (data.ec && data.ec.word && data.ec.word.length > 0) {
            const wordData = data.ec.word[0];
            
            // 获取词性和释义
            if (wordData.trs) {
                wordData.trs.forEach(tr => {
                    if (tr.tr && tr.tr.length > 0) {
                        tr.tr.forEach(item => {
                            if (item.l && item.l.i && item.l.i.length > 0) {
                                const pos = item.l.pos || '';
                                const meanings = item.l.i.map(i => i.l || '').filter(m => m).join('; ');
                                if (meanings) {
                                    chineseMeanings.push(`${pos ? '[' + pos + '] ' : ''}${meanings}`);
                                }
                            }
                        });
                    }
                });
            }
        }
        
        // 如果没有获取到详细释义，使用简单翻译
        if (chineseMeanings.length === 0) {
            // 备用方案：使用MyMemory API
            console.log(`有道词典未找到 "${word}"，使用备用翻译...`);
            const fallbackResponse = await fetch(
                `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|zh-CN`
            );
            
            if (fallbackResponse.ok) {
                const fallbackData = await fallbackResponse.json();
                if (fallbackData.responseStatus === 200 && fallbackData.responseData) {
                    return fallbackData.responseData.translatedText;
                }
            }
            return '暂无中文翻译';
        }
        
        // 去重并合并释义
        const uniqueMeanings = [...new Set(chineseMeanings)];
        return uniqueMeanings.join('\n');
        
    } catch (error) {
        console.error('获取中文释义失败:', error);
        
        // 最后的备用方案
        try {
            const response = await fetch(
                `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|zh-CN`
            );
            
            if (response.ok) {
                const data = await response.json();
                if (data.responseStatus === 200 && data.responseData) {
                    return data.responseData.translatedText;
                }
            }
        } catch (e) {
            console.error('备用翻译也失败:', e);
        }
        
        return '暂无中文翻译';
    }
}

// 从CET4数据中提取中文释义
function extractChineseFromCET4(cet4Data) {
    const meanings = [];
    
    try {
        const content = cet4Data.content;
        if (!content || !content.word || !content.word.content) {
            return meanings;
        }
        
        const wordContent = content.word.content;
        
        // 提取主要翻译
        if (wordContent.trans && wordContent.trans.length > 0) {
            wordContent.trans.forEach(trans => {
                if (trans.tranCn) {
                    const pos = trans.pos ? `[${trans.pos}]` : '';
                    meanings.push(`${pos} ${trans.tranCn}`);
                }
            });
        }
        
        // 提取同义词中的翻译
        if (wordContent.syno && wordContent.syno.synos) {
            wordContent.syno.synos.forEach(syno => {
                if (syno.tran && syno.pos) {
                    const existingPos = meanings.some(m => m.includes(`[${syno.pos}]`));
                    if (!existingPos) {
                        meanings.push(`[${syno.pos}] ${syno.tran}`);
                    }
                }
            });
        }
        
    } catch (error) {
        console.error('解析CET4数据失败:', error);
    }
    
    return meanings;
}

// 查询并添加单词
async function searchAndAddWord() {
    const word = elements.wordInput.value.trim();
    
    if (!word) {
        alert('请输入单词');
        return;
    }
    
    // 检查是否已存在
    if (AppState.words.some(w => w.word.toLowerCase() === word.toLowerCase())) {
        alert('该单词已存在于单词本中');
        return;
    }
    
    try {
        elements.btnSearch.textContent = '查询中...';
        elements.btnSearch.disabled = true;
        
        // 查询词典
        const wordInfo = await searchOxfordDictionary(word);
        
        // 获取详细的中文翻译
        const chineseMeaning = await getDetailedChineseMeaning(word);
        
        // 创建单词对象
        const newWord = {
            id: Date.now(),
            word: wordInfo.word,
            phonetic: wordInfo.phonetic,
            englishMeaning: wordInfo.meanings.map(m => `${m.partOfSpeech}: ${m.definition}`).join('\n'),
            chineseMeaning: chineseMeaning,
            examples: wordInfo.meanings.filter(m => m.example).map(m => m.example).slice(0, 2),
            createdAt: new Date().toISOString()
        };
        
        // 添加到单词列表
        AppState.words.unshift(newWord);
        saveWords();
        
        // 显示结果
        displayWordResult(newWord);
        
        // 清空输入
        elements.wordInput.value = '';
        
        // 刷新列表
        renderWordList();
        
    } catch (error) {
        alert('查询失败，请检查单词拼写或网络连接');
        console.error(error);
    } finally {
        elements.btnSearch.textContent = '查询并添加';
        elements.btnSearch.disabled = false;
    }
}

// 显示查询结果
function displayWordResult(word) {
    // 格式化中文释义，将换行符转换为<br>
    const formattedChinese = word.chineseMeaning.replace(/\n/g, '<br>');
    
    elements.wordResult.innerHTML = `
        <div class="word-title">${word.word}</div>
        ${word.phonetic ? `<div class="word-phonetic">${word.phonetic}</div>` : ''}
        <div class="word-meaning">
            <strong>中文释义：</strong><br>${formattedChinese}<br><br>
            <strong>英文释义：</strong><br>
            ${word.englishMeaning.replace(/\n/g, '<br>')}
            ${word.examples.length > 0 ? `<br><br><strong>例句：</strong><br>${word.examples.join('<br>')}` : ''}
        </div>
    `;
    elements.wordResult.classList.add('show');
}

// 渲染单词列表
function renderWordList() {
    elements.wordCount.textContent = AppState.words.length;
    
    if (AppState.words.length === 0) {
        elements.wordList.innerHTML = '<div class="empty-state">暂无单词，开始添加你的第一个单词吧！</div>';
        return;
    }
    
    elements.wordList.innerHTML = AppState.words.map(word => {
        // 只显示第一行中文释义，避免列表过长
        const firstLine = word.chineseMeaning.split('\n')[0];
        return `
        <div class="word-item" data-id="${word.id}">
            <div class="word-item-header">
                <span class="word-item-word">${word.word}</span>
                <button class="word-item-delete" onclick="deleteWord(${word.id})">删除</button>
            </div>
            ${word.phonetic ? `<div style="color: #999; font-size: 14px; margin-bottom: 5px;">${word.phonetic}</div>` : ''}
            <div class="word-item-meaning">
                <strong>中文：</strong>${firstLine}
            </div>
        </div>
        `;
    }).join('');
}

// 删除单词
function deleteWord(id) {
    if (confirm('确定要删除这个单词吗？')) {
        AppState.words = AppState.words.filter(w => w.id !== id);
        saveWords();
        renderWordList();
    }
}

// 开始背诵
function startStudy() {
    if (AppState.words.length === 0) {
        alert('单词本为空，请先添加一些单词');
        return;
    }
    
    // 获取需要复习的单词（基于遗忘曲线）
    const reviewWords = getWordsForReview();
    
    if (reviewWords.length === 0) {
        // 如果没有需要复习的单词，检查是否有新单词
        const newWords = AppState.words.filter(word => !AppState.wordLearningStats[word.id]);
        
        if (newWords.length === 0) {
            alert('恭喜！所有单词都已掌握，暂无需要复习的单词');
            return;
        }
        
        // 使用新单词进行学习
        AppState.studyWords = [...newWords].sort(() => Math.random() - 0.5);
    } else {
        // 使用需要复习的单词
        AppState.studyWords = [...reviewWords].sort(() => Math.random() - 0.5);
    }
    
    AppState.currentStudyIndex = 0;
    AppState.pendingReviewWords = []; // 清空待复习队列
    AppState.wordsSinceLastReview = 0; // 重置计数器
    
    // 显示背诵卡片
    elements.studyCard.classList.remove('hidden');
    elements.studyComplete.classList.add('hidden');
    
    showCurrentCard();
}

// 显示当前卡片
function showCurrentCard() {
    const word = AppState.studyWords[AppState.currentStudyIndex];
    
    elements.currentIndex.textContent = AppState.currentStudyIndex + 1;
    elements.totalCount.textContent = AppState.studyWords.length;
    
    // 更新进度条
    const progress = ((AppState.currentStudyIndex + 1) / AppState.studyWords.length) * 100;
    elements.progressFill.style.width = `${progress}%`;
    
    // 根据显示模式显示内容
    if (AppState.displayMode === 'chinese') {
        // 显示中文，回忆英文
        // 只显示第一行中文释义作为提示
        const chineseHint = word.chineseMeaning.split('\n')[0];
        elements.cardWord.textContent = chineseHint;
        elements.cardMeaning.innerHTML = `
            <div style="font-size: 32px; margin-bottom: 10px;">${word.word}</div>
            ${word.phonetic ? `<div style="font-size: 18px;">${word.phonetic}</div>` : ''}
            <div style="font-size: 16px; margin-top: 10px;">${word.englishMeaning.replace(/\n/g, '<br>')}</div>
        `;
    } else {
        // 显示英文，回忆中文
        elements.cardWord.textContent = word.word;
        // 格式化中文释义，支持多行显示
        const formattedChinese = word.chineseMeaning.replace(/\n/g, '<br>');
        elements.cardMeaning.innerHTML = `
            <div style="font-size: 24px; margin-bottom: 10px;">${formattedChinese}</div>
            ${word.englishMeaning ? `<div style="font-size: 16px;">${word.englishMeaning.replace(/\n/g, '<br>')}</div>` : ''}
        `;
    }
    
    // 隐藏释义
    elements.cardMeaning.classList.add('hidden');
    
    // 隐藏确认按钮区域
    elements.confirmButtons.classList.add('hidden');
    elements.confirmButtons.innerHTML = '';
    
    // 显示原来的"记得"和"不记得"按钮
    elements.btnRemember.classList.remove('hidden');
    elements.btnForget.classList.remove('hidden');
}

// 处理"记得"按钮
function handleRemember() {
    // 显示释义和二次确认选项
    showConfirmOptions('remember');
}

// 处理"不记得"按钮
function handleForget() {
    // 显示释义和确认选项
    showConfirmOptions('forget');
}

// 显示确认选项
function showConfirmOptions(type) {
    const word = AppState.studyWords[AppState.currentStudyIndex];
    
    // 显示释义
    elements.cardMeaning.classList.remove('hidden');
    
    // 隐藏原来的按钮
    elements.btnRemember.classList.add('hidden');
    elements.btnForget.classList.add('hidden');
    
    // 根据类型显示不同的确认选项
    if (type === 'remember') {
        // 记得的情况：显示两个选项
        elements.confirmButtons.innerHTML = `
            <button class="study-btn confirm-remember" onclick="handleConfirmRemember()">
                ✓ 我真的记住啦
            </button>
            <button class="study-btn confirm-forget" onclick="handleConfirmForget()">
                😅 补好>_<，还是不记得
            </button>
        `;
    } else {
        // 不记得的情况：显示一个选项
        elements.confirmButtons.innerHTML = `
            <button class="study-btn confirm-sure" onclick="handleConfirmSure()">
                💪 这次一定记住
            </button>
        `;
    }
    
    elements.confirmButtons.classList.remove('hidden');
}

// 处理"我真的记住啦"
function handleConfirmRemember() {
    const word = AppState.studyWords[AppState.currentStudyIndex];
    
    // 更新学习状态：标记为正确
    updateWordLearningStatus(word.id, true);
    
    hideConfirmOptions();
    nextCard();
}

// 处理"补好>_<，还是不记得"
function handleConfirmForget() {
    const word = AppState.studyWords[AppState.currentStudyIndex];
    
    // 更新学习状态：标记为错误
    updateWordLearningStatus(word.id, false);
    
    // 将该单词添加到待复习队列
    AppState.pendingReviewWords.push(word);
    
    hideConfirmOptions();
    nextCard();
}

// 处理"这次一定记住"
function handleConfirmSure() {
    const word = AppState.studyWords[AppState.currentStudyIndex];
    
    // 更新学习状态：标记为错误（因为用户说不记得）
    updateWordLearningStatus(word.id, false);
    
    // 将该单词添加到待复习队列
    AppState.pendingReviewWords.push(word);
    
    hideConfirmOptions();
    nextCard();
}

// 隐藏确认选项
function hideConfirmOptions() {
    elements.confirmButtons.classList.add('hidden');
    elements.confirmButtons.innerHTML = '';
    elements.btnRemember.classList.remove('hidden');
    elements.btnForget.classList.remove('hidden');
}

// 进入下一个卡片
function nextCard() {
    AppState.wordsSinceLastReview++;
    
    // 检查是否需要插入待复习的单词（每5个单词后）
    if (AppState.wordsSinceLastReview >= 5 && AppState.pendingReviewWords.length > 0) {
        // 从待复习队列中取出一个单词
        const reviewWord = AppState.pendingReviewWords.shift();
        
        // 检查该单词是否已经连续正确3次（已掌握）
        const stats = AppState.wordLearningStats[reviewWord.id];
        if (!stats || stats.consecutiveCorrect < 3) {
            // 将待复习单词插入到当前索引的下一个位置
            AppState.studyWords.splice(AppState.currentStudyIndex + 1, 0, reviewWord);
        }
        
        // 重置计数器
        AppState.wordsSinceLastReview = 0;
    }
    
    AppState.currentStudyIndex++;
    
    if (AppState.currentStudyIndex >= AppState.studyWords.length) {
        // 完成背诵
        showStudyComplete();
    } else {
        showCurrentCard();
    }
}

// 显示完成界面
function showStudyComplete() {
    elements.studyCard.classList.add('hidden');
    elements.studyComplete.classList.remove('hidden');
    elements.reviewedCount.textContent = AppState.studyWords.length;
}

// 重新开始
function restartStudy() {
    startStudy();
}

// 保存单词到localStorage
function saveWords() {
    localStorage.setItem('cet4_words', JSON.stringify(AppState.words));
}

// 从localStorage加载单词
function loadWords() {
    const saved = localStorage.getItem('cet4_words');
    if (saved) {
        AppState.words = JSON.parse(saved);
    }
    
    // 加载单词学习统计
    const statsSaved = localStorage.getItem('word_learning_stats');
    if (statsSaved) {
        AppState.wordLearningStats = JSON.parse(statsSaved);
    }
}

// 保存单词学习统计到localStorage
function saveWordLearningStats() {
    localStorage.setItem('word_learning_stats', JSON.stringify(AppState.wordLearningStats));
}

// 初始化单词学习统计
function initWordLearningStats(wordId) {
    if (!AppState.wordLearningStats[wordId]) {
        AppState.wordLearningStats[wordId] = {
            consecutiveCorrect: 0, // 连续正确次数
            lastReviewTime: null, // 上次复习时间
            reviewCount: 0, // 总复习次数
            nextReviewTime: null, // 下次复习时间
            isFirstLearned: false // 是否首次学会
        };
    }
}

// 计算遗忘曲线下次复习时间（基于艾宾浩斯遗忘曲线）
function calculateNextReviewTime(reviewCount, consecutiveCorrect) {
    const now = new Date();
    let intervalHours;
    
    // 根据复习次数和连续正确次数确定间隔
    if (consecutiveCorrect >= 3) {
        // 连续3次正确，标记为已掌握，不再推送
        return null;
    }
    
    switch(reviewCount) {
        case 0:
            intervalHours = 0.5; // 第一次复习：30分钟后
            break;
        case 1:
            intervalHours = 1; // 第二次复习：1小时后
            break;
        case 2:
            intervalHours = 8; // 第三次复习：8小时后
            break;
        case 3:
            intervalHours = 24; // 第四次复习：1天后
            break;
        case 4:
            intervalHours = 72; // 第五次复习：3天后
            break;
        default:
            intervalHours = 168; // 之后：7天后
            break;
    }
    
    // 如果连续正确次数多，可以适当延长间隔
    if (consecutiveCorrect > 0) {
        intervalHours *= Math.pow(1.5, consecutiveCorrect);
    }
    
    const nextReview = new Date(now.getTime() + intervalHours * 60 * 60 * 1000);
    return nextReview.toISOString();
}

// 更新单词学习状态
function updateWordLearningStatus(wordId, isCorrect) {
    initWordLearningStats(wordId);
    
    const stats = AppState.wordLearningStats[wordId];
    stats.reviewCount++;
    stats.lastReviewTime = new Date().toISOString();
    
    if (isCorrect) {
        stats.consecutiveCorrect++;
        
        // 如果连续正确3次，标记为已掌握
        if (stats.consecutiveCorrect >= 3) {
            stats.nextReviewTime = null; // 不再安排复习
        } else {
            stats.nextReviewTime = calculateNextReviewTime(stats.reviewCount, stats.consecutiveCorrect);
        }
    } else {
        // 如果不正确，重置连续正确计数
        stats.consecutiveCorrect = 0;
        stats.nextReviewTime = calculateNextReviewTime(stats.reviewCount, 0);
    }
    
    // 保存更新后的统计
    saveWordLearningStats();
}

// 获取需要复习的单词列表
function getWordsForReview() {
    const now = new Date();
    const wordsToReview = [];
    
    AppState.words.forEach(word => {
        const stats = AppState.wordLearningStats[word.id];
        
        // 如果没有学习统计，说明是新单词，需要学习
        if (!stats) {
            wordsToReview.push(word);
            return;
        }
        
        // 如果已经连续正确3次，跳过
        if (stats.consecutiveCorrect >= 3) {
            return;
        }
        
        // 检查是否到了复习时间
        if (stats.nextReviewTime) {
            const nextReview = new Date(stats.nextReviewTime);
            if (nextReview <= now) {
                wordsToReview.push(word);
            }
        } else if (!stats.isFirstLearned) {
            // 首次学习的单词
            wordsToReview.push(word);
        }
    });
    
    return wordsToReview;
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);
