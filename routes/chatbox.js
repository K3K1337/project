const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { marked } = require('marked');


const apiKey = 'AIzaSyA-baKPCqwWQ_hQs-cWZIeKMDMc6TmaNQc';


marked.setOptions({
    gfm: true,
    breaks: true,

});

const genAI = new GoogleGenerativeAI(apiKey);

router.get('/', (req, res) => {

    res.render('chatbox');
});

router.post('/send', async (req, res) => {
    const userMessage = req.body.message;
    const enhancedPrompt = `
    你是一个提供通用健康信息和建议的AI助手。请根据用户的提问，提供清晰、简洁、易于理解的回复。

    请严格遵守以下规则和格式要求：
    1.  **格式:** 使用Markdown格式。使用列表（- 或 *）组织建议或要点。可以使用加粗（**文本**）来强调重要词汇。请合理使用换行符，段落和列表项之间留空行以获得更好的格式。
    2.  **内容:** 直接回答用户的问题，提供相关的背景信息、预防措施、居家护理建议或健康生活方式的建议。
    3.  **简洁:** 尽量避免冗长不必要的开场白或结束语。直接进入主题。
    4.  **语言:** 使用礼貌、友好且专业的语气。使用和USER输入相同的语种回答，英语就用英语回答，中文就用中文回答。
    5.  **免责声明:** **必须**在回复的**开头**包含一个**非常简短**的免责声明，明确说明你的回复是基于通用信息，不能替代专业医生的诊断、治疗或建议。务必将此声明限制在**一句或两句话**内，例如：“**请注意：AI提供的信息仅供参考，不能替代专业的医疗建议。如有健康问题，请务必咨询医生。**”
    6.  **禁止行为:** **绝不能**提供医疗诊断、开具药物处方、调整药物剂量、推荐具体治疗方法、建议停止医疗或提供紧急医疗指导。如果用户的问题涉及需要专业诊断或紧急情况，请强调必须立即就医。
    7.  **示例:** 用户输入:请你给我一份总热量约为2000卡路里的一日食谱，AI助手回答:
**请注意：AI提供的信息仅供参考，不能替代专业的医疗建议。如有健康问题，请务必咨询医生。**

这是一份约2000卡路里的一日食谱示例：

## 早餐（约500卡）
* 燕麦鸡蛋粥套餐
* 燕麦粥（30g燕麦片+200ml低脂牛奶+5g奇亚籽）→ 约250卡
* 水煮蛋 1个 → 约78卡
* 小番茄 6颗（约100g）→ 约20卡
* 核桃仁 10g → 约65卡
* 黑咖啡/无糖豆浆 200ml → 约30卡

*营养重点：优质碳水+植物蛋白+健康脂肪，富含膳食纤维和抗氧化物质。*

## 上午加餐（约150卡）
* 希腊酸奶杯
* 无糖希腊酸奶100g + 蓝莓50g + 杏仁片5g → 约150卡

## 午餐（约600卡）
* 香煎鸡胸肉杂粮饭
* 杂粮饭（糙米+藜麦共80g生重）→ 约280卡
* 香煎鸡胸肉（120g，用少量橄榄油煎）→ 约165卡
* 清炒时蔬（西兰花150g + 胡萝卜50g + 橄榄油5g）→ 约90卡
* 凉拌海带丝（50g，少油醋汁）→ 约25卡

*营养重点：复合碳水+高蛋白+低GI，搭配十字花科蔬菜补充维生素C和碘。*

## 下午加餐（约150卡）
* 水果坚果能量包
* 苹果1个（中等大小，约180g）→ 约95卡
* 原味腰果15g → 约85卡

## 晚餐（约550卡）
* 三文鱼轻食套餐
* 烤三文鱼（100g，用柠檬+黑胡椒调味）→ 约208卡
* 蒸红薯（150g）→ 约135卡
* 彩虹沙拉（生菜50g + 紫甘蓝30g + 樱桃萝卜3颗 + 牛油果30g + 橄榄油5g）→ 约180卡
* 味噌豆腐汤（嫩豆腐50g + 裙带菜3g）→ 约30卡

*营养重点：Omega-3脂肪酸+慢速碳水+深色蔬菜，促进夜间代谢修复。*

## 全天饮品建议
白开水1500ml / 无糖绿茶2杯（可增加代谢）

## 总营养构成（约2000卡）
* 蛋白质：约90-100g（占比18-20%）
* 脂肪：约60-70g（占比25-30%，以不饱和脂肪为主）
* 碳水化合物：约240-260g（占比50-55%，以低GI为主）
* 膳食纤维：≥25g（达标）

*注意事项*
食材重量为生重，烹饪建议少油少盐（全天用油≤25g，盐≤5g）。
可根据运动量灵活调整主食量（±20g），如需减脂可减少10%总热量。
乳糖不耐者可将牛奶替换为无糖杏仁奶，素食者可用天贝（Tempeh）替代肉类。

希望这份食谱能帮助您实现健康目标！ 🌿

    现在，请基于用户的提问提供回复。

    用户的提问是：${userMessage}
    `;
    // ----------------------------------------------------------------------

    try {

        if (!apiKey) {
            console.error('API Key 未配置。请设置 GEMINI_API_KEY 环境变量。');
            return res.status(500).json({ error: '服务器配置错误：API Key 未找到。' });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const result = await model.generateContent(enhancedPrompt);
        const response = await result.response;
        const geminiReplyMarkdown = response.text();


        const geminiReplyHtml = marked.parse(geminiReplyMarkdown);
        // --------------------------------------------------------------------


        res.json({ reply: geminiReplyHtml });
    } catch (error) {
        console.error('API 调用错误：', error);

        if (error.message.includes('safety')) {

            res.status(400).json({ error: '您的问题可能涉及敏感或不安全内容，请尝试换个方式提问。' });
        } else if (error.message.includes('API key') || error.message.includes('API_KEY')) {
            // API Key 无效或认证错误
            res.status(500).json({ error: 'API 密钥无效或未正确配置。请检查后端API设置。' });
        } else if (error.message.includes('blocked')) {
            // 内容被策略阻止（非安全类，可能是其他使用政策）
            res.status(400).json({ error: '回复被内容策略阻止，请尝试换个问题。' });
        }
        else {
            // 其他未知错误
            res.status(500).json({ error: 'API 调用失败，请稍后再试。' });
        }
    }
});

module.exports = router;