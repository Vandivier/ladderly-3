import { LadderlyPageWrapper } from '~/app/core/components/page-wrapper/LadderlyPageWrapper'

export const metadata = {
  title: 'Ladderly Copilot',
  description: 'An AI tool trained on Ladderly content.',
}

const LadderlyCopilotPage = () => {
  return (
    <LadderlyPageWrapper authenticate requirePremium>
      <div className="flex flex-col items-center justify-center">
        <h1 className="my-4 text-2xl font-semibold">Ladderly Copilot</h1>
      </div>

      <div className="px-6" id="ladderly-copilot">
        <iframe
          src="https://www.chatbase.co/chatbot-iframe/NnbDY2pCxZROnVKZwpjaW"
          width="100%"
          style={{ height: '100%', minHeight: '700px', borderRadius: '8px' }}
        ></iframe>
      </div>
    </LadderlyPageWrapper>
  )
}

export default LadderlyCopilotPage
