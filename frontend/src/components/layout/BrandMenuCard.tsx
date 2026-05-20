import { Info, LogOut, Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { useSignOutMutation } from '@/features/auth/api'

import { Background, Card, IconWrap, Logo, LogoMark, MenuBox, Wrapper } from './BrandMenuCard.styles'

const menuItems = [
  {
    label: '退出登录',
    size: '70%',
    delay: '0s',
    gradient: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #ff53d4 60%, #62c2fe 90%)',
    icon: <LogOut size={18} strokeWidth={2.4} />,
    action: 'logout' as const,
  },
  {
    label: '全局设置',
    size: '50%',
    delay: '0.2s',
    gradient: 'radial-gradient(circle at 30% 107%, #91e9ff 0%, #00acee 90%)',
    icon: <Settings size={18} strokeWidth={2.4} />,
    action: 'settings' as const,
  },
  {
    label: '了解详情',
    size: '30%',
    delay: '0.4s',
    gradient: 'radial-gradient(circle at 30% 107%, #969fff 0%, #b349ff 90%)',
    icon: <Info size={18} strokeWidth={2.4} />,
    action: 'info' as const,
  },
]

export function BrandMenuCard() {
  const navigate = useNavigate()
  const signOutMutation = useSignOutMutation()

  return (
    <Wrapper>
      <Card aria-label="Aura Studio menu">
        <Background />
        <Logo>
          <LogoMark>AS</LogoMark>
        </Logo>

        {menuItems.map((item) => (
          <MenuBox
            key={item.label}
            type="button"
            aria-label={item.label}
            title={item.label}
            $size={item.size}
            $delay={item.delay}
            $gradient={item.gradient}
            onClick={() => {
              if (item.action === 'logout') {
                signOutMutation.mutate(undefined, {
                  onSuccess: () => navigate('/login', { replace: true }),
                })
                return
              }

              if (item.action === 'settings') {
                navigate('/settings')
                return
              }

              navigate('/writing')
            }}
          >
            <IconWrap>{item.icon}</IconWrap>
          </MenuBox>
        ))}
      </Card>
    </Wrapper>
  )
}

// 左下角悬浮品牌菜单，负责快捷动作入口。
