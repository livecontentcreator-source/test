"""Mini-app per parlare con l'agente Storyteller (Anthropic Managed Agent).

Crea una sessione sull'agente/ambiente già creati in Console, apre lo stream
PRIMA di inviare il messaggio (stream-first), stampa il testo dell'agente in
streaming e chiude quando la sessione va in idle con stop reason terminale.
"""

import sys

import anthropic

AGENT_ID = "agent_0181brzFzzszkRFYLtP6nBwP"
ENVIRONMENT_ID = "env_014XSNDGgm7MZia3iSUeHHHX"


def main() -> int:
    prompt = " ".join(sys.argv[1:]).strip()
    if not prompt:
        try:
            prompt = input("Messaggio per l'agente: ").strip()
        except (EOFError, KeyboardInterrupt):
            return 1
    if not prompt:
        print("Nessun messaggio, esco.", file=sys.stderr)
        return 1

    client = anthropic.Anthropic()  # legge ANTHROPIC_API_KEY dall'ambiente

    try:
        session = client.beta.sessions.create(
            agent=AGENT_ID,
            environment_id=ENVIRONMENT_ID,
            title="Creator Hub — richiesta script",
        )
    except anthropic.AuthenticationError:
        print("ANTHROPIC_API_KEY mancante o non valida.", file=sys.stderr)
        return 1
    except anthropic.APIStatusError as e:
        print(f"Errore creando la sessione ({e.status_code}): {e.message}", file=sys.stderr)
        return 1

    print(
        f"Sessione live: https://platform.claude.com/workspaces/default/sessions/{session.id}",
        file=sys.stderr,
    )

    exit_code = 0
    try:
        # Stream-first: lo stream consegna solo gli eventi emessi dopo l'apertura,
        # quindi va aperto prima di inviare il messaggio.
        with client.beta.sessions.events.stream(session_id=session.id) as stream:
            client.beta.sessions.events.send(
                session_id=session.id,
                events=[
                    {
                        "type": "user.message",
                        "content": [{"type": "text", "text": prompt}],
                    }
                ],
            )

            for event in stream:
                if event.type == "agent.message":
                    for block in event.content:
                        if block.type == "text":
                            print(block.text, end="", flush=True)

                elif event.type == "session.error":
                    print(f"\n[errore sessione] {event}", file=sys.stderr)
                    exit_code = 1
                    break

                elif event.type == "session.status_idle":
                    # Idle transitorio: l'agente sta aspettando un'azione del client
                    # (conferma tool / risultato custom tool) — non è la fine.
                    stop = getattr(event, "stop_reason", None)
                    if stop is not None and getattr(stop, "type", "") == "requires_action":
                        continue
                    break  # end_turn (o retries_exhausted): finito

                elif event.type == "session.status_terminated":
                    print("\n[sessione terminata]", file=sys.stderr)
                    exit_code = 1
                    break

    except KeyboardInterrupt:
        print("\nInterrotto.", file=sys.stderr)
        exit_code = 130
    except anthropic.APIStatusError as e:
        print(f"\nErrore API ({e.status_code}): {e.message}", file=sys.stderr)
        exit_code = 1
    except anthropic.APIConnectionError:
        print("\nErrore di rete: controlla la connessione e riprova.", file=sys.stderr)
        exit_code = 1

    print()
    return exit_code


if __name__ == "__main__":
    sys.exit(main())
