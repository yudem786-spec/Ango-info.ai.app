
exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Método não permitido." })
    };
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("Chave API não configurada.");
    }

    const { message } = JSON.parse(event.body || "{}");

    if (!message || typeof message !== "string" || !message.trim()) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Escreve uma pergunta." })
      };
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{
              text: "És o ANGO INFO AI, um assistente inteligente especializado em Angola. Responde em português claro, com respeito, precisão e simplicidade. Ajuda com história, cultura, províncias, municípios, turismo, economia, educação e oportunidades em Angola. Também podes responder a perguntas gerais. Nunca inventes factos; quando não tiveres certeza, explica isso."
            }]
          },
          contents: [{
            role: "user",
            parts: [{ text: message.trim() }]
          }]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro Gemini:", data);
      return {
        statusCode: 502,
        body: JSON.stringify({
          error: "Não foi possível obter uma resposta da inteligência artificial."
        })
      };
    }

    const answer = data.candidates?.[0]?.content?.parts
      ?.map(part => part.text || "")
      .join("")
      .trim();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        answer: answer || "Não consegui gerar uma resposta. Tenta novamente."
      })
    };

  } catch (error) {
    console.error("Erro:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Ocorreu um erro no servidor. Tenta novamente."
      })
    };
  }
};
