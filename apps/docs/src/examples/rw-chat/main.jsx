import { useGSAP } from '@gsap/react';
import { each, Motly, rand } from '@motly/gsap';
import { gsap } from 'gsap';
import { useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

gsap.registerPlugin(useGSAP, Motly);

const heart =
  'M50 88C22 66 6 50 6 32C6 18 17 8 30 8C39 8 46 13 50 20C54 13 61 8 70 8C83 8 94 18 94 32C94 50 78 66 50 88Z';

// The confetti's colors, handed out in turn, and a random fall for each piece.
const confetti = { fill: each(['#ffd166', '#06d6a0', '#ef476f']), duration: rand(0.7, 1) };

/** One Spec per reaction: plain data, so it lives outside the components. */
const reactions = {
  '❤️': {
    kind: 'burst',
    count: 8,
    radius: [10, 55],
    restAt: 0.4,
    children: {
      kind: 'path',
      d: heart,
      radius: [rand(5, 8), 0],
      fill: '#ef476f',
      duration: rand(0.6, 0.9),
    },
  },
  '🎉': {
    kind: 'burst',
    count: 14,
    radius: [10, rand(60, 80)],
    easing: 'ease-out',
    restAt: 0.35,
    children: each([
      {
        kind: 'star',
        points: 5,
        radius: [rand(3, 6), 0],
        angle: [0, rand(-270, 270)],
        ...confetti,
      },
      { kind: 'polygon', points: 4, radius: [rand(3, 5), 0], angle: [0, 90], ...confetti },
    ]),
  },
  '👍': {
    kind: 'burst',
    count: 6,
    radius: [10, 45],
    restAt: 0.4,
    children: { kind: 'circle', radius: [rand(3, 5), 0], fill: '#118ab2', duration: 0.6 },
  },
};

const thread = [
  { id: 1, author: 'Ada', text: 'The release is out. Provenance and all.' },
  { id: 2, author: 'Lin', text: 'Docs site next? People keep asking how Swirl works.' },
  { id: 3, author: 'Sam', text: 'Try deleting a message mid-burst: nothing is left behind.' },
];

function Message({ message, onDelete }) {
  const scope = useRef(null);
  const [picked, setPicked] = useState({});
  // Every burst made through contextSafe belongs to this component's GSAP context, which useGSAP
  // reverts on unmount: delete the message mid-burst and its burst is cleared with it.
  const { contextSafe } = useGSAP({ scope });

  const react = contextSafe((emoji, button) => {
    const on = !picked[emoji];
    setPicked({ ...picked, [emoji]: on });
    if (on) gsap.effects.burst(button, { spec: reactions[emoji] });
  });

  return (
    <article className="message" ref={scope}>
      <div className="meta">
        <span>{message.author}</span>
        <button type="button" onClick={() => onDelete(message.id)}>
          Delete
        </button>
      </div>
      <p>{message.text}</p>
      <div className="reactions">
        {Object.keys(reactions).map((emoji) => (
          <button
            type="button"
            key={emoji}
            aria-pressed={Boolean(picked[emoji])}
            onClick={(event) => react(emoji, event.currentTarget)}
          >
            {emoji} {picked[emoji] ? 1 : ''}
          </button>
        ))}
      </div>
    </article>
  );
}

function Chat() {
  const [messages, setMessages] = useState(thread);
  const remove = (id) => setMessages(messages.filter((message) => message.id !== id));

  return (
    <section className="chat">
      {messages.map((message) => (
        <Message key={message.id} message={message} onDelete={remove} />
      ))}
      {messages.length < thread.length && (
        <button type="button" className="restore" onClick={() => setMessages(thread)}>
          Restore messages
        </button>
      )}
    </section>
  );
}

createRoot(document.querySelector('#app')).render(<Chat />);
