import { GoogleGenAI, Type } from "@google/genai";

export async function getAIFeedback(situation: string, userInput: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
  const model = "gemini-3-flash-preview";
  
  try {
    const response = await Promise.race([
      ai.models.generateContent({
        model,
        contents: `상황: ${situation}\n학생의 답변: ${userInput}`,
        config: {
          systemInstruction: `당신은 중학생의 국어 화법과 사회성 향상을 돕는 교육용 AI 튜터입니다.
학생의 답변을 다음 세 가지 기준으로 평가하세요:
1. 단어의 적절성 (상황에 맞는 어휘 사용)
2. 상대방을 존중하는 태도 (공손성 원리 등)
3. 비언어적 신호의 조화 (이모티콘, 문장 부호 등의 적절한 사용)

[중요 전략: 촉진(Prompting)]
답변이 부족할 경우 정답을 바로 알려주지 말고, 학생이 스스로 문장을 수정할 수 있도록 힌트나 질문을 던져 유도하세요.
학생이 충분히 잘했을 때만 최종 통과 판정을 내리세요.

응답은 반드시 JSON 형식으로 해주세요.

JSON 구조:
{
  "isPassed": true/false (최종 통과 여부),
  "feedback": "학생에게 해줄 따뜻하고 구체적인 조언 또는 수정 유도 질문 (한국어)",
  "scores": {
    "wordAppropriateness": 0~100,
    "respect": 0~100,
    "nonVerbal": 0~100
  },
  "analysis": {
    "cognitive": 0~10,
    "emotional": 0~10,
    "behavioral": 0~10
  }
}`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isPassed: { type: Type.BOOLEAN },
              feedback: { type: Type.STRING },
              scores: {
                type: Type.OBJECT,
                properties: {
                  wordAppropriateness: { type: Type.NUMBER },
                  respect: { type: Type.NUMBER },
                  nonVerbal: { type: Type.NUMBER }
                }
              },
              analysis: {
                type: Type.OBJECT,
                properties: {
                  cognitive: { type: Type.NUMBER },
                  emotional: { type: Type.NUMBER },
                  behavioral: { type: Type.NUMBER }
                }
              }
            }
          }
        }
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('AI Request Timeout')), 60000))
    ]) as any;

    let text = response.text || '{}';
    text = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to get AI feedback:", e);
    return null;
  }
}
