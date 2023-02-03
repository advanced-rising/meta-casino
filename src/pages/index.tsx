import dynamic from 'next/dynamic'
import Instructions from '@/components/dom/Instructions'
import Link from 'next/link'
import { useJoinRoom, useWatingRoom } from '../utils/hook'
import { CREATE_ROOM_REQUEST } from '../../server/handler/SocketRoom'
import { IRoom } from '../../server/repository/rooms'
import { socket } from '../utils/context'
import { useState } from 'react'

// Dynamic import is used to prevent a payload when the website starts, that includes threejs, r3f etc..
// WARNING ! errors might get obfuscated by using dynamic import.
// If something goes wrong go back to a static import to show the error.
// https://github.com/pmndrs/react-three-next/issues/49
const Logo = dynamic(() => import('@/components/canvas/Logo'), { ssr: false })

// Dom components go here
export default function Page(props) {
  useJoinRoom(socket, 'wating-room')
  const { rooms } = useWatingRoom(socket)

  const [newRoom, setNewRoom] = useState('')

  const createRoomEnterHandler = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newRoom.length > 0) {
      if (rooms.filter((room) => newRoom === room.roomNm).length > 0) {
        alert('해당 방 이름은 이미 존재합니다.')
        return
      }
      socket.emit(CREATE_ROOM_REQUEST, newRoom)
      setNewRoom('')
    }
  }
  return (
    <div>
      <input
        className='text-black'
        type='text'
        onChange={(e) => setNewRoom(e.target.value)}
        value={newRoom}
        onKeyDown={createRoomEnterHandler}
      />
      <ul className=''>
        {rooms.map((room: IRoom) => (
          <li key={room.id} className='text-white'>
            <Link href={`/room/[id]`} as={`/room/${room.id}`}>
              {room.roomNm}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

// Canvas components go here
// It will receive same props as the Page component (from getStaticProps, etc.)
Page.canvas = (props) => {
  return <Logo scale={0.5} route='/blob' position-y={-1} />
}

export async function getStaticProps() {
  return { props: { title: 'Index' } }
}
