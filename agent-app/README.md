# Agent App — Storyteller (Managed Agent)

Mini-app da terminale che parla con l'agente Anthropic creato dalla Console
(`agent_0181brzFzzszkRFYLtP6nBwP`): crea una sessione, invia il tuo messaggio
e stampa la risposta dell'agente in streaming.

## Setup

```bash
cd agent-app
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
export ANTHROPIC_API_KEY="sk-ant-..."
```

## Uso

```bash
# messaggio come argomento
python main.py "Lavoro a Lisbona, apertura di un rooftop bar, ho solo 2 ore di luce. Dammi lo script."

# oppure interattivo
python main.py
```

La app stampa anche il link alla sessione nella Console, così puoi seguirla
live da `platform.claude.com`.

## Note

- L'agente e l'ambiente sono già creati nella Console e vengono riferiti per ID
  (non vengono ricreati a ogni run — è il pattern corretto).
- La sessione si chiude quando l'agente va in `idle` con stop reason terminale;
  errori e sessioni terminate fanno uscire con codice 1.
