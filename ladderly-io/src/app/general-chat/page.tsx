import Script from 'next/script'
import { LadderlyPageWrapper } from '~/app/core/components/page-wrapper/LadderlyPageWrapper'

export const metadata = {
  title: 'General Consultant AI',
  description: 'Ask the General Consultant AI anything!',
}

const GeneralConsultantChatPage = () => {
  return (
    <LadderlyPageWrapper>
      <div className="flex flex-col items-center justify-center">
        <h1 className="my-4 text-2xl font-semibold">General Consultant AI</h1>
      </div>

      <div className="px-6">
        <iframe
          src="https://www.chatbase.co/chatbot-iframe/NnbDY2pCxZROnVKZwpjaW"
          width="100%"
          style={{ height: '100%', minHeight: '700px' }}
        ></iframe>
      </div>
    </LadderlyPageWrapper>
  )
}

export default GeneralConsultantChatPage
